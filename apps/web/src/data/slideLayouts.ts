/**
 * Master-Slide Layouts für SEPShow
 * Jedes Layout definiert vorgefertigte Elemente auf einer 960×540 Folie.
 */

export interface LayoutElement {
    type: 'text' | 'image' | 'shape';
    x: number;
    y: number;
    width: number;
    height: number;
    text?: string;
    fontSize?: number;
    fontFamily?: string;
    fontStyle?: string;
    fill?: string;
    align?: string;
    placeholder?: string;
}

export interface SlideLayout {
    id: string;
    name: string;
    icon: string;
    background: string;
    elements: LayoutElement[];
}

export const SLIDE_LAYOUTS: SlideLayout[] = [
    {
        id: 'title',
        name: 'Titelfolie',
        icon: '🏷️',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        elements: [
            {
                type: 'text',
                x: 80, y: 160, width: 800, height: 80,
                text: 'Titel hier eingeben',
                fontSize: 44, fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
                fill: '#f8fafc', align: 'center',
                placeholder: 'Titel hier eingeben',
            },
            {
                type: 'text',
                x: 160, y: 260, width: 640, height: 50,
                text: 'Untertitel',
                fontSize: 22, fontFamily: 'Inter, sans-serif', fontStyle: 'normal',
                fill: '#94a3b8', align: 'center',
                placeholder: 'Untertitel',
            },
        ],
    },
    {
        id: 'title-content',
        name: 'Titel + Inhalt',
        icon: '📄',
        background: '#0f172a',
        elements: [
            {
                type: 'text',
                x: 50, y: 30, width: 860, height: 60,
                text: 'Folientitel',
                fontSize: 36, fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
                fill: '#f8fafc', align: 'left',
                placeholder: 'Folientitel',
            },
            {
                type: 'shape',
                x: 50, y: 95, width: 860, height: 3,
                fill: '#38bdf8',
            },
            {
                type: 'text',
                x: 50, y: 120, width: 860, height: 380,
                text: '• Punkt 1\n• Punkt 2\n• Punkt 3',
                fontSize: 22, fontFamily: 'Inter, sans-serif', fontStyle: 'normal',
                fill: '#e2e8f0', align: 'left',
                placeholder: 'Inhalt hier eingeben...',
            },
        ],
    },
    {
        id: 'two-columns',
        name: 'Zwei Spalten',
        icon: '📊',
        background: '#0f172a',
        elements: [
            {
                type: 'text',
                x: 50, y: 30, width: 860, height: 60,
                text: 'Folientitel',
                fontSize: 36, fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
                fill: '#f8fafc', align: 'left',
                placeholder: 'Folientitel',
            },
            {
                type: 'shape',
                x: 50, y: 95, width: 860, height: 3,
                fill: '#38bdf8',
            },
            {
                type: 'text',
                x: 50, y: 120, width: 410, height: 380,
                text: 'Linke Spalte\n• Punkt A\n• Punkt B',
                fontSize: 20, fontFamily: 'Inter, sans-serif', fontStyle: 'normal',
                fill: '#e2e8f0', align: 'left',
                placeholder: 'Linke Spalte...',
            },
            {
                type: 'text',
                x: 500, y: 120, width: 410, height: 380,
                text: 'Rechte Spalte\n• Punkt C\n• Punkt D',
                fontSize: 20, fontFamily: 'Inter, sans-serif', fontStyle: 'normal',
                fill: '#e2e8f0', align: 'left',
                placeholder: 'Rechte Spalte...',
            },
        ],
    },
    {
        id: 'image-left',
        name: 'Bild links',
        icon: '🖼️',
        background: '#0f172a',
        elements: [
            {
                type: 'text',
                x: 500, y: 30, width: 420, height: 60,
                text: 'Folientitel',
                fontSize: 32, fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
                fill: '#f8fafc', align: 'left',
                placeholder: 'Folientitel',
            },
            {
                type: 'shape',
                x: 40, y: 30, width: 420, height: 480,
                fill: '#1e293b',
            },
            {
                type: 'text',
                x: 500, y: 110, width: 420, height: 390,
                text: 'Beschreibung hier...',
                fontSize: 20, fontFamily: 'Inter, sans-serif', fontStyle: 'normal',
                fill: '#e2e8f0', align: 'left',
                placeholder: 'Beschreibung...',
            },
        ],
    },
    {
        id: 'image-right',
        name: 'Bild rechts',
        icon: '🖼️',
        background: '#0f172a',
        elements: [
            {
                type: 'text',
                x: 40, y: 30, width: 420, height: 60,
                text: 'Folientitel',
                fontSize: 32, fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
                fill: '#f8fafc', align: 'left',
                placeholder: 'Folientitel',
            },
            {
                type: 'shape',
                x: 500, y: 30, width: 420, height: 480,
                fill: '#1e293b',
            },
            {
                type: 'text',
                x: 40, y: 110, width: 420, height: 390,
                text: 'Beschreibung hier...',
                fontSize: 20, fontFamily: 'Inter, sans-serif', fontStyle: 'normal',
                fill: '#e2e8f0', align: 'left',
                placeholder: 'Beschreibung...',
            },
        ],
    },
    {
        id: 'quote',
        name: 'Zitat',
        icon: '💬',
        background: 'linear-gradient(45deg, #1e293b, #0f172a)',
        elements: [
            {
                type: 'text',
                x: 100, y: 180, width: 760, height: 100,
                text: '"Der beste Weg, die Zukunft vorherzusagen, ist, sie selbst zu gestalten."',
                fontSize: 32, fontFamily: 'Serif', fontStyle: 'italic',
                fill: '#f8fafc', align: 'center',
            },
            {
                type: 'text',
                x: 100, y: 300, width: 760, height: 40,
                text: '— Peter Drucker',
                fontSize: 20, fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
                fill: '#38bdf8', align: 'center',
            },
        ],
    },
    {
        id: 'impact',
        name: 'Impact-Zahl',
        icon: '🎯',
        background: '#0f172a',
        elements: [
            {
                type: 'text',
                x: 100, y: 150, width: 760, height: 150,
                text: '99%',
                fontSize: 120, fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
                fill: '#10b981', align: 'center',
            },
            {
                type: 'text',
                x: 100, y: 320, width: 760, height: 60,
                text: 'Kundenzufriedenheit',
                fontSize: 28, fontFamily: 'Inter, sans-serif',
                fill: '#f8fafc', align: 'center',
            },
        ],
    },
    {
        id: 'blank',
        name: 'Leer',
        icon: '⬜',
        background: '#0f172a',
        elements: [],
    },
];

/**
 * Gibt ein Layout anhand seiner ID zurück.
 */
export function getLayoutById(id: string): SlideLayout | undefined {
    return SLIDE_LAYOUTS.find((l) => l.id === id);
}
