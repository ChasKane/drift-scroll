import {
	App,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
	MarkdownView,
} from "obsidian";

interface AutoScrollSettings {
	speed: number;
	showRibbonIcon: boolean;
}

const DEFAULT_SETTINGS: AutoScrollSettings = {
	speed: 0.2,
	showRibbonIcon: true,
};
const ribbonActiveClassName = "autoscroll-ribbon-active";
const pluginId = "autoscroll";
export default class AutoScrollPlugin extends Plugin {
	settings: AutoScrollSettings;
	active: boolean = false;
	intervalId: number;
	pixelfractionCounter: number = 0;
	ribbonIconEl: HTMLElement;

	private stopScroll() {
		this.ribbonIconEl?.classList.remove(ribbonActiveClassName);
		new Notice("Stopping Auto Scroller");
		window.clearInterval(this.intervalId);
		this.active = false;
	}

	toggleScrolling() {
		if (this.active) {
			this.stopScroll();
		} else {
			this.ribbonIconEl?.classList.add(ribbonActiveClassName);
			new Notice("Starting Auto Scroller");
			this.active = true;
			this.intervalId = this.registerInterval(
				window.setInterval(() => this.performScroll(), 10)
			);
		}
	}

	async increaseSpeed() {
		if (this.settings.speed >= 2) {
			this.settings.speed = 0.1;
		} else {
			// to mitigate precision issues (e.g. avoid .1 + .1 = .20000000001)
			this.settings.speed = Math.round(this.settings.speed * 10 + 1) / 10;
		}
		await this.saveSettings();
		new Notice("Setting speed to " + this.settings.speed);
	}

	async decreaseSpeed() {
		if (this.settings.speed <= 0.1) {
			this.settings.speed = 2;
		} else {
			// to mitigate precision issues (e.g. avoid .1 + .1 = .20000000001)
			this.settings.speed = Math.round(this.settings.speed * 10 - 1) / 10;
		}
		await this.saveSettings();
		new Notice("Setting speed to " + this.settings.speed);
	}
	private performScroll() {
		this.pixelfractionCounter += this.settings.speed;
		if (this.pixelfractionCounter < 1) return;

		const markdownView =
			this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!markdownView) {
			new Notice("No markdown view found");
			this.stopScroll();
			return;
		}

		// Check if we're in reading mode or editing mode
		const isReadingMode = markdownView.getMode() === "preview";

		if (isReadingMode) {
			// Handle reading mode scrolling
			const readingView = markdownView.previewMode;
			if (readingView) {
				const scrollContainer = readingView.containerEl.querySelector(
					".markdown-preview-view"
				);
				if (scrollContainer) {
					const currentScrollTop = scrollContainer.scrollTop;
					scrollContainer.scrollTop =
						currentScrollTop + this.pixelfractionCounter;
					this.pixelfractionCounter %= 1;

					// Check if we've reached the bottom
					const newScrollTop = scrollContainer.scrollTop;
					if (Math.abs(newScrollTop - currentScrollTop) < 0.1) {
						new Notice("Scrolled to the end!");
						this.stopScroll();
					}
				} else {
					new Notice("Reading view container not found");
					this.stopScroll();
				}
			} else {
				new Notice("Reading view not available");
				this.stopScroll();
			}
		} else {
			// Handle editing mode scrolling (original logic)
			const editor = markdownView.editor;
			if (editor) {
				const { top, left } = editor.getScrollInfo();
				editor.scrollTo(left, top + this.pixelfractionCounter);
				this.pixelfractionCounter %= 1;

				const { top: newTop } = editor.getScrollInfo();
				if (top === newTop) {
					new Notice("Scrolled to the end!");
					this.stopScroll();
				}
			} else {
				new Notice("Editor not available");
				this.stopScroll();
			}
		}
	}

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: "toggle-scrolling",
			name: "Autoscroller: toggle scrolling",
			callback: this.toggleScrolling.bind(this),
		});
		this.addCommand({
			id: "increase-speed",
			name: "Autoscroller: increase speed",
			callback: this.increaseSpeed.bind(this),
		});
		this.addCommand({
			id: "decrease-speed",
			name: "Autoscroller: decrease speed",
			callback: this.decreaseSpeed.bind(this),
		});

		if (this.settings.showRibbonIcon) {
			this.ribbonIconEl = this.addRibbonIcon(
				"double-down-arrow-glyph",
				`Auto Scroller (speed ${this.settings.speed})`,
				(e) => {
					if (e.button === 0) {
						// left mouse button
						this.toggleScrolling();
					} else {
						// right mouse button
						this.increaseSpeed();
					}
				}
			);
		}

		this.addSettingTab(new AutoScrollSettingTab(this.app, this));
	}

	onunload() {
		window.clearInterval(this.intervalId);
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class AutoScrollSettingTab extends PluginSettingTab {
	plugin: AutoScrollPlugin;

	constructor(app: App, plugin: AutoScrollPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", { text: "Settings for Autoscroll Plugin" });

		new Setting(containerEl)
			.setName("Show Ribbon Icon")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.showRibbonIcon)
					.onChange((value) => {
						this.plugin.settings.showRibbonIcon = value;
						this.plugin.saveSettings();
						if (value) {
							this.plugin.ribbonIconEl =
								this.plugin.addRibbonIcon(
									"double-down-arrow-glyph",
									`Auto Scroller (speed ${this.plugin.settings.speed})`,
									(e) => {
										if (e.button === 0) {
											// left mouse button
											this.plugin.toggleScrolling();
										} else {
											// right mouse button
											this.plugin.increaseSpeed();
										}
									}
								);
						} else {
							this.plugin.ribbonIconEl?.remove();
						}
					})
			);

		new Setting(containerEl)
			.setName("Default scrolling speed")
			.setDesc("The number of pixels to pass in 10 ms")
			.addSlider((slider) =>
				slider
					.setLimits(0.1, 2, 0.1)
					.setValue(this.plugin.settings.speed)
					.setDynamicTooltip()
					.onChange(async (value) => {
						this.plugin.settings.speed = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
