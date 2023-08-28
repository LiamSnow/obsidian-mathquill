declare var MathQuill: any;
import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import * as path from 'path';
import { StateField, StateEffect, EditorState } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';
import { Decoration, DecorationSet, EditorView, ViewPlugin, ViewUpdate } from '@codemirror/view';

interface ObsidianMathquillSettings {
    inlineIdentifier: string;
    blockIdentifier: string;
}

const DEFAULT_SETTINGS: ObsidianMathquillSettings = {
    inlineIdentifier: '$',
    blockIdentifier: '$$'
}

export default class ObsidanMathquillPlugin extends Plugin {
    settings: ObsidianMathquillSettings;

    async onload() {
        await this.loadSettings();
        // await this.loadAssets();

        const field = StateField.define({
            create() {
                return DecorationSet.create({}, [Decoration.range(5, 5, {widget: createDecoration()})]);
            },
            update(decorations, tr) {
                return tr.docChanged ? decorations.map(tr.changes) : decorations;
            },
            provide: f => EditorView.decorations.from(f)
        });

        this.registerEditorExtension([field.extension]);

        // this.registerMarkdownPostProcessor((el, ctx) => {
        //     console.log(2);
        //     // Your custom processing code here.
        //     let inlineMathElems = el.querySelectorAll('span.math.inline');
        //     let blockMathElems = el.querySelectorAll('div.math.display');

        //     // For inline Math
        //     inlineMathElems.forEach(elem => {
        //         console.log(3);

        //         let latex = elem.textContent; // get the LaTeX code
        //         let mathFieldSpan = document.createElement('span');
        //         let mathField = MathQuill.MathField(mathFieldSpan, {
        //             spaceBehavesLikeTab: true,
        //             handlers: {
        //                 edit: function () {
        //                     // handle edits if needed
        //                 }
        //             }
        //         });
        //         if (latex) {
        //             mathField.latex(latex);
        //         }
        //         else mathField.latex();

        //         elem.replaceWith(mathFieldSpan); // replace the original LaTeX span with MathQuill
        //     });
        // });

        // This adds a settings tab so the user can configure various aspects of the plugin
        this.addSettingTab(new ObsidianMathquillSettingTab(this.app, this));
    }

    async onunload() {
        await this.unloadAssets();
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    async loadAssets(): Promise<void> {
        return new Promise((resolve) => {
            // add css
            //TODO use manifest
            const link = document.createElement('link');
            link.id = 'obsidian-mathquill-css';
            link.rel = 'stylesheet';
            link.href = this.getAsset('mathquill/build/mathquill.css');
            document.head.appendChild(link);

            // add js
            const scripta = document.createElement('script');
            scripta.id = 'obsidian-mathquill-scripta';
            scripta.src = this.getAsset('/mathquill/formula/jquery.min.js');
            document.body.appendChild(scripta);

            const scriptb = document.createElement('script');
            scriptb.id = 'obsidian-mathquill-scriptb';
            scriptb.src = this.getAsset('/mathquill/build/mathquill.js');
            scriptb.onload = () => {
                resolve();
            };
            document.body.appendChild(scriptb);
        });
    }

    async unloadAssets() {
        //remove css
        const link = document.getElementById('obsidian-mathquill-css');
        if (link) {
            link.remove();
        }

        //remove js
        const scripta = document.getElementById('obsidian-mathquill-scripta');
        if (scripta) {
            document.body.removeChild(scripta);
        }

        const scriptb = document.getElementById('obsidian-mathquill-scriptb');
        if (scriptb) {
            document.body.removeChild(scriptb);
        }
    }

    getAsset(assetPath: string) {
        return this.app.vault.adapter.getResourcePath(
            path.join(this.app.vault.configDir, "plugins", this.manifest.id, assetPath));
    }
}

//------------------------------------------------------------------------------------------------------



function createDecoration() {
    return Decoration.widget({
        widget: (view) => {
            const dom = document.createElement('div');
            dom.className = 'custom-decoration';
            dom.textContent = '|';
            return dom;
        },
        side: 1
    });
}

//------------------------------------------------------------------------------------------------------


class ObsidianMathquillSettingTab extends PluginSettingTab {
        plugin: ObsidanMathquillPlugin;

        constructor(app: App, plugin: ObsidanMathquillPlugin) {
            super(app, plugin);
            this.plugin = plugin;
        }

        display(): void {
            const { containerEl } = this;

            containerEl.empty();

            new Setting(containerEl)
                .setName('Inline Idenifier')
                .setDesc('TODO')
                .addText(text => text
                    .setPlaceholder('$')
                    .setValue(this.plugin.settings.inlineIdentifier)
                    .onChange(async (value) => {
                        this.plugin.settings.inlineIdentifier = value;
                        await this.plugin.saveSettings();
                    }));

            new Setting(containerEl)
                .setName('Block Idenifier')
                .setDesc('TODO')
                .addText(text => text
                    .setPlaceholder('$#')
                    .setValue(this.plugin.settings.blockIdentifier)
                    .onChange(async (value) => {
                        this.plugin.settings.blockIdentifier = value;
                        await this.plugin.saveSettings();
                    }));
        }
    }
