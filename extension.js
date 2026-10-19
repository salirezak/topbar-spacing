import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

export default class TopbarSpacingExtension extends Extension {
    enable() {
        this._settings = this.getSettings();

        this._sections = [
            {
                position: 'left',
                key: 'left-padding',
                enabledKey: 'left-padding-enabled',
                box: Main.panel._leftBox,
            },
            {
                position: 'center',
                key: 'center-padding',
                enabledKey: 'center-padding-enabled',
                box: Main.panel._centerBox,
            },
            {
                position: 'right',
                key: 'right-padding',
                enabledKey: 'right-padding-enabled',
                box: Main.panel._rightBox,
            },
        ];

        this._settingsSignals = [];
        this._buttons = new Set();

        for (const section of this._sections) {
            this._applySpacing(section);

            for (const key of [section.key, section.enabledKey]) {
                const signalId = this._settings.connect(
                    `changed::${key}`,
                    () => {
                        this._removeSpacing(section);
                        this._applySpacing(section);
                    }
                );

                this._settingsSignals.push(signalId);
            }
        }
    }

    _getPanelButton(actor) {
        if (actor.has_style_class_name?.('panel-button'))
            return actor;

        const children = actor.get_children?.() ?? [];

        for (const child of children) {
            if (child.has_style_class_name?.('panel-button'))
                return child;
        }

        return null;
    }

    _refreshActor(actor) {
        const styleClass = actor.get_style_class_name();

        actor.set_style_class_name('topbar-spacing-temporary-refresh');
        actor.set_style_class_name(styleClass);
    }

    _buildStyleLine(value) {
        let line = `-natural-hpadding: ${value}px`;

        if (value < 6)
            line += `; -minimum-hpadding: ${value}px`;

        return line;
    }

    _applyToButton(button) {
        const style = `${button._tsLine}; ${button._tsOriginal || ''}`;

        button._tsApplied = style;
        button.set_style(style);

        this._refreshActor(button);
    }

    _overrideStyle(actor, section) {
        const button = this._getPanelButton(actor);

        if (!button)
            return;

        if (!this._settings.get_boolean(section.enabledKey))
            return;

        if (button._tsSection === section) {
            button._tsLine = this._buildStyleLine(
                this._settings.get_int(section.key)
            );

            this._applyToButton(button);
            return;
        }

        if (button._tsSection)
            this._cleanupButton(button, true);

        if (button._tsOriginal === undefined)
            button._tsOriginal = button.get_style();

        button._tsSection = section;

        button._tsLine = this._buildStyleLine(
            this._settings.get_int(section.key)
        );

        button._tsSignalId = button.connect('style-changed', () => {
            const current = button.get_style();

            if (current === button._tsApplied)
                return;

            button._tsOriginal = current;

            this._applyToButton(button);
        });

        button._tsDestroySignalId = button.connect('destroy', () => {
            this._cleanupButton(button, false, true);
        });

        this._buttons.add(button);

        this._applyToButton(button);
    }

    _cleanupButton(button, restoreStyle = false, destroying = false) {
        const originalStyle = button._tsOriginal;

        if (button._tsSignalId) {
            try {
                button.disconnect(button._tsSignalId);
            } catch {
            }

            delete button._tsSignalId;
        }

        if (button._tsDestroySignalId) {
            if (!destroying) {
                try {
                    button.disconnect(button._tsDestroySignalId);
                } catch {
                }
            }

            delete button._tsDestroySignalId;
        }

        if (restoreStyle && !destroying && originalStyle !== undefined) {
            button.set_style(originalStyle);
            this._refreshActor(button);
        }

        this._buttons.delete(button);

        delete button._tsOriginal;
        delete button._tsApplied;
        delete button._tsLine;
        delete button._tsSection;
    }

    _restoreButton(button) {
        this._cleanupButton(button, true);
    }

    _applySpacing(section) {
        if (!this._settings.get_boolean(section.enabledKey))
            return;

        for (const actor of section.box.get_children())
            this._overrideStyle(actor, section);

        if (!section.addedSignal) {
            section.addedSignal = section.box.connect(
                'child-added',
                (_container, actor) => {
                    this._overrideStyle(actor, section);
                }
            );
        }

        if (!section.removedSignal) {
            section.removedSignal = section.box.connect(
                'child-removed',
                (_container, actor) => {
                    const button = this._getPanelButton(actor);

                    if (button && button._tsSection === section)
                        this._restoreButton(button);
                }
            );
        }
    }

    _removeSpacing(section) {
        if (section.addedSignal) {
            section.box.disconnect(section.addedSignal);
            section.addedSignal = null;
        }

        if (section.removedSignal) {
            section.box.disconnect(section.removedSignal);
            section.removedSignal = null;
        }

        for (const button of [...this._buttons]) {
            if (button._tsSection === section)
                this._restoreButton(button);
        }
    }

    disable() {
        for (const signalId of this._settingsSignals)
            this._settings.disconnect(signalId);

        for (const section of this._sections)
            this._removeSpacing(section);

        for (const button of [...this._buttons])
            this._restoreButton(button);

        this._settingsSignals = null;
        this._buttons = null;
        this._sections = null;
        this._settings = null;
    }
}