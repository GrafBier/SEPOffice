# MUST be the very first thing for PyInstaller + Windows multiprocessing.
# Without this, uvicorn worker processes re-execute the whole script and
# try to bind port 8080 a second time -> EADDRINUSE / WinError 10048.
import multiprocessing
multiprocessing.freeze_support()

print("AI Service: Script started.")
import sys
import os
import json
import threading
import uvicorn
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

print("AI Service: Base imports done.")
print("AI Service: Preparing fast startup...")

# Moved transformers import inside lazy loader to unblock server startup
# from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM

print(f"AI Service: Current working directory: {os.getcwd()}")

app = FastAPI(title="SEPOffice AI Service")
print("AI Service: FastAPI app initialized.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CorrectionRequest(BaseModel):
    text: str

class CompletionRequest(BaseModel):
    text: str
    max_new_tokens: Optional[int] = 10

class FormulaRequest(BaseModel):
    query: str

class ErrorExplainRequest(BaseModel):
    error: str
    formula: str

class SmartFillRequest(BaseModel):
    items: list[str]

class OptimizeRequest(BaseModel):
    text: str

class GridActionRequest(BaseModel):
    context: str
    instruction: str
    gridData: list[list[str]]
    computedData: list[list[str]]
    selection: dict

# Global AI generator
generator = None
last_error = None
model_loading = False
loading_progress = 0
import asyncio

async def background_model_load():
    global generator, last_error, model_loading, loading_progress
    model_loading = True
    loading_progress = 0
    print("AI Service: Starting background model loading...")
    
    import sys
    # Base directory for finding the model
    if getattr(sys, 'frozen', False):
        base_dir = os.path.dirname(sys.executable)
        bundled_model_path = os.path.join(base_dir, "ai", "model")
        if not os.path.isdir(bundled_model_path):
            bundled_model_path = os.path.join(base_dir, "model")
    else:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        bundled_model_path = os.path.join(base_dir, "model")

    model_to_load = "Qwen/Qwen2.5-0.5B"
    if os.path.isdir(bundled_model_path):
        print(f"Loading bundled model from: {bundled_model_path}")
        model_to_load = bundled_model_path
    else:
        print(f"Model directory not found at {bundled_model_path}. Fallback to HF cache.")

    try:
        # Load in a separate thread to not block the event loop
        def _load():
            global loading_progress
            print(f"Initializing pipeline with model: {model_to_load}")

            # Import only what we need
            from transformers import pipeline

            # Single step: pipeline() handles tokenizer + model internally.
            # We avoid AutoModelForCausalLM + device_map which requires `accelerate`.
            loading_progress = 10
            pipe = pipeline(
                "text-generation",
                model=model_to_load,
                tokenizer=model_to_load,
                max_new_tokens=15,
                do_sample=False,
                device=-1,          # -1 = CPU, no accelerate needed
                trust_remote_code=True,
            )
            loading_progress = 100
            return pipe
        
        # Run the heavy loading in a thread executer
        loop = asyncio.get_event_loop()
        generator = await loop.run_in_executor(None, _load)
        print("Model loaded successfully.")
    except Exception as e:
        last_error = str(e)
        loading_progress = 0
        print("Failed to load model:", e)
    finally:
        model_loading = False

@app.on_event("startup")
async def startup_event():
    import asyncio
    # Schedule the model loading as a background task
    asyncio.create_task(background_model_load())

@app.get("/health")
def health_check():
    status = "ok"
    if model_loading:
        status = "loading"
    elif generator is None:
        status = "error" if last_error else "uninitialized"
        
    return {
        "status": status, 
        "service": "ai",
        "model_loaded": generator is not None,
        "progress": loading_progress,
        "last_error": last_error
    }

@app.post("/api/correct")
def correct_text(req: CorrectionRequest):
    # Dummy correction for MVP
    return {"corrected": req.text, "suggestions": []}

@app.post("/api/complete")
def complete_text(req: CompletionRequest):
    if not generator:
        return {"completion": ""}
    
    # We only care about the end of the text to predict what's next
    context = req.text[-200:] if len(req.text) > 200 else req.text
    if len(context.strip()) == 0:
        return {"completion": ""}
        
    try:
        # Prompt model 
        out = generator(req.text, num_return_sequences=1)
        generated_text = out[0]["generated_text"]
        
        # We only want the *new* text, so strip the original prompt
        if generated_text.startswith(req.text):
            completion = generated_text[len(req.text):]
        else:
            completion = generated_text
            
        return {"completion": completion.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/formula")
async def generate_formula(req: FormulaRequest):
    if generator is None:
        return {"formula": ""}
    
    prompt = f"You are an Excel expert. Translate the following user request into a precise Excel formula. Reply ONLY with the formula. Do not provide explanations.\nRequest: {req.query}\nFormula: ="
    try:
        out = generator(prompt, max_new_tokens=30, num_return_sequences=1)
        generated_text = out[0]["generated_text"]
        
        if generated_text.startswith(prompt):
            formula = generated_text[len(prompt):].strip()
        else:
            formula = generated_text.replace(prompt, "").strip()
            
        formula = formula.split("\n")[0].strip()
        return {"formula": "=" + formula}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/explain_error")
async def explain_error(req: ErrorExplainRequest):
    if generator is None:
        return {"explanation": ""}
    
    prompt = f"Du bist ein freundlicher Excel-Assistent. Erkläre den folgenden Formel-Fehler in 1-2 kurzen Sätzen auf Deutsch und schlage eine Lösung vor.\nFormel: {req.formula}\nFehler: {req.error}\nErklärung:"
    try:
        out = generator(prompt, max_new_tokens=40, num_return_sequences=1)
        generated_text = out[0]["generated_text"]
        
        if generated_text.startswith(prompt):
            explanation = generated_text[len(prompt):].strip()
        else:
            explanation = generated_text.replace(prompt, "").strip()
            
        return {"explanation": explanation}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/smart_fill")
async def smart_fill(req: SmartFillRequest):
    if generator is None:
        return {"filled": []}
        
    items_str = ", ".join([f"[{i}]" if i else "[?]" for i in req.items])
    prompt = f"Du bist eine 'Smart Fill' KI in einer Tabelle. Erkenne das Muster und fülle die fehlenden Werte [?] logisch aus. Antworte NUR mit den fehlenden Werten, zeilenweise getrennt.\nMuster: {items_str}\nFehlende Werte:"
    
    try:
        out = generator(prompt, max_new_tokens=40, num_return_sequences=1)
        generated_text = out[0]["generated_text"]
        
        if generated_text.startswith(prompt):
            filled_text = generated_text[len(prompt):].strip()
        else:
            filled_text = generated_text.replace(prompt, "").strip()
            
        # Parse output into array
        results = [line.strip().strip("[]") for line in filled_text.split("\n") if line.strip()]
        return {"filled": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/optimize_text")
async def optimize_text(req: OptimizeRequest):
    if generator is None:
        return {"optimized": req.text}
        
    prompt = f"Du bist ein professioneller Lektor für SEPOffice. Korrigiere den folgenden Text auf Grammatik und Rechtschreibung. Ändere den Stil nur minimal, um die Lesbarkeit zu verbessern. Antworte NUR mit dem korrigierten Text ohne Kommentare.\nText: {req.text}\nKorrigierter Text:"
    
    try:
        out = generator(prompt, max_new_tokens=150, num_return_sequences=1)
        generated_text = out[0]["generated_text"]
        
        if generated_text.startswith(prompt):
            optimized = generated_text[len(prompt):].strip()
        else:
            optimized = generated_text.replace(prompt, "").strip()
            
        return {"optimized": optimized}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

import json

@app.post("/api/grid_action")
async def grid_action(req: GridActionRequest):
    if generator is None:
        return {"new_grid_data": req.gridData}
        
    # We serialize the top-left portion of the grid to save tokens
    # For MVP, just send the first 15 rows and 10 cols to give AI context
    preview_rows = req.gridData[:15]
    preview_data = [row[:10] for row in preview_rows]
    
    context_str = json.dumps(preview_data)

    prompt = f"""Du bist eine Tabellen-KI. Der Nutzer wählt die Funktion: '{req.context}'.
Instruktion des Nutzers: '{req.instruction}'.
Aktuelle Daten (Top 15x10): {context_str}

Leite aus der Instruktion und den Daten ab, wie die neue Tabelle aussehen soll (z.B. nach Sortierung, Filtern, Duplikate entfernen oder Erstellung einer kleinen Pivot).
Antworte AUSSCHLIESSLICH mit einem validen JSON Array aus Arrays (die neue Matrix). Jedes innere Array ist eine Zeile. Keine Erklärungen, nur das rohe JSON Array!
Ergebnis JSON:"""

    try:
        print(f"--- PROMPT ---\n{prompt}\n--- END PROMPT ---")
        out = generator(prompt, max_new_tokens=400, num_return_sequences=1)
        generated_text = out[0]["generated_text"]
        print(f"--- GENERATED TEXT ---\n{generated_text}\n--- END GENERATED ---")
        
        if generated_text.startswith(prompt):
            json_response = generated_text[len(prompt):].strip()
        else:
            json_response = generated_text.replace(prompt, "").strip()
        
        print(f"--- JSON RESPONSE CANDIDATE ---\n{json_response}\n--- END ---")
        
        # Clean up any markdown blocks if the AI insists on adding them
        json_response = json_response.removeprefix("```json").removeprefix("```").removesuffix("```").strip()

        try:
            new_data = json.loads(json_response)
            
            # Pad the response to match the original grid dimensions to not break the frontend
            orig_rows = len(req.gridData)
            orig_cols = len(req.gridData[0]) if orig_rows > 0 else 26
            
            padded_data = []
            for r in range(orig_rows):
                new_row = []
                for c in range(orig_cols):
                    if r < len(new_data) and c < len(new_data[r]):
                        new_row.append(str(new_data[r][c]))
                    else:
                        new_row.append("")
                padded_data.append(new_row)

            return {"new_grid_data": padded_data}
        except json.JSONDecodeError:
            # Fallback if AI fails to output valid JSON
            print("Failed to parse JSON from AI:", json_response)
            return {"new_grid_data": req.gridData}

    except Exception as e:
        print("Error during grid action:", e)
        return {"new_grid_data": req.gridData}

if __name__ == "__main__":
    # Start the FastAPI server on port 8080.
    uvicorn.run(app, host="0.0.0.0", port=8080)
