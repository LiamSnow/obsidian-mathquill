declare var MQ: any;
import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

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

        //inject css
        const cssPath = this.app.plugin['obsidian-mathquill'].directory + 'node_modules/mathquill/build/mathquill.css';
        if (!document.getElementById('mathquill-styles')) {
            const link = document.createElement('link');
            link.id = 'mathquill-styles';
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = cssPath;
            document.head.appendChild(link);
        }

        console.log(13, "LOAD");

        const script = document.createElement('script');
        script.src = 'node_modules/build/mathquill.js';
        script.onload = () => {
            console.log("haha");
            // The script has finished loading and is now available.
            // You can now safely use the `MQ` variable from the MathQuill library.
        };
        document.body.appendChild(script);

        // this.registerMarkdownPostProcessor((el, ctx) => {
        //     // Your custom processing code here.
        //     let inlineMathElems = el.querySelectorAll('span.math.inline');
        //     let blockMathElems = el.querySelectorAll('div.math.display');

        //     // For inline Math
        //     inlineMathElems.forEach(elem => {
        //         console.log(13, "FOUND INLINE");

        //         let latex = elem.textContent; // get the LaTeX code
        //         let mathFieldSpan = document.createElement('span');
        //         let mathField = MQ.MathField(mathFieldSpan, {
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

    onunload() {

    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}

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
