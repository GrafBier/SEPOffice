import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

const pluginKey = new PluginKey('ghostText')

export interface GhostTextOptions {
    getSuggestion: (text: string) => Promise<string>
}

export const GhostText = Extension.create<GhostTextOptions>({
    name: 'ghostText',

    addOptions() {
        return {
            getSuggestion: async () => '',
        }
    },

    addProseMirrorPlugins() {
        let timeout: number | null = null
        let currentSuggestion = ''

        return [
            new Plugin({
                key: pluginKey,
                state: {
                    init() {
                        return DecorationSet.empty
                    },
                    apply(tr, oldState) {
                        const suggestion = tr.getMeta(pluginKey)
                        if (suggestion !== undefined) {
                            if (!suggestion) return DecorationSet.empty

                            // We render the ghost text right at the current cursor selection
                            const { to } = tr.selection
                            const decoration = Decoration.widget(to, () => {
                                const span = document.createElement('span')
                                span.className = 'ghost-text'
                                span.textContent = suggestion
                                span.style.color = '#94a3b8'
                                span.style.pointerEvents = 'none'
                                span.style.opacity = '0.7'
                                return span
                            })
                            return DecorationSet.create(tr.doc, [decoration])
                        }

                        // If document changed, clear suggestion and trigger new fetch
                        if (tr.docChanged) {
                            return DecorationSet.empty
                        }
                        return oldState
                    },
                },
                props: {
                    decorations(state) {
                        return this.getState(state)
                    },
                    handleKeyDown: (view, event) => {
                        const state = pluginKey.getState(view.state)
                        const hasSuggestion = state !== DecorationSet.empty

                        if (hasSuggestion && (event.key === 'Tab' || event.key === 'ArrowRight')) {
                            // Get the actual text
                            const decos = state.find()
                            if (decos.length > 0) {
                                const suggestionText = currentSuggestion

                                // Clear the suggestion
                                view.dispatch(view.state.tr.setMeta(pluginKey, ''))
                                currentSuggestion = ''

                                // Insert the text
                                view.dispatch(view.state.tr.insertText(suggestionText))
                                return true // Prevent default behavior
                            }
                        }

                        // Clear suggestion on any other key
                        if (hasSuggestion && event.key !== 'Shift' && event.key !== 'Control' && event.key !== 'Alt') {
                            view.dispatch(view.state.tr.setMeta(pluginKey, ''))
                            currentSuggestion = ''
                        }
                        return false
                    },
                },
                view: () => {
                    return {
                        update: (view, prevState) => {
                            if (view.state.doc.eq(prevState.doc)) return

                            // Debounced fetch
                            if (timeout) window.clearTimeout(timeout)
                            timeout = window.setTimeout(async () => {
                                const { from, to } = view.state.selection
                                if (from !== to) return // Don't suggest if text is selected

                                // Get context text
                                const textBeforeCount = Math.min(from, 200)
                                const text = view.state.doc.textBetween(Math.max(0, from - textBeforeCount), from, '\n')

                                if (text.trim().length === 0) return

                                const suggestion = await this.options.getSuggestion(text)
                                if (suggestion && view.state.selection.from === from) {
                                    currentSuggestion = suggestion
                                    view.dispatch(view.state.tr.setMeta(pluginKey, suggestion))
                                }
                            }, 600)
                        },
                        destroy: () => {
                            if (timeout) window.clearTimeout(timeout)
                        }
                    }
                },
            }),
        ]
    },
})
