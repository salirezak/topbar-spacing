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

        const value = this._settings.get_int(section.key);

        if (button._tsOriginal === undefined)
            button._tsOriginal = button.get_style();

        button._tsLine = this._buildStyleLine(value);

        if (!button._tsSignalId) {
            button._tsSignalId = button.connect('style-changed', () => {
                const current = button.get_style();

                if (current === button._tsApplied)
                    return;

                button._tsOriginal = current;

                this._applyToButton(button);
            });
        }

        this._applyToButton(button);
    }

    _restoreButton(button) {
        if (button._tsSignalId) {
            button.disconnect(button._tsSignalId);
            delete button._tsSignalId;
        }

        if (button._tsOriginal !== undefined) {
            button.set_style(button._tsOriginal);
            this._refreshActor(button);
        }

        delete button._tsOriginal;
        delete button._tsApplied;
        delete button._tsLine;
    }

    _applySpacing(section) {
        if (!this._settings.get_boolean(section.enabledKey))
            return;

        for (const actor of section.box.get_children())
            this._overrideStyle(actor, section);

        section.addedSignal = section.box.connect(
            'child-added',
            (_container, actor) => this._overrideStyle(actor, section)
        );
    }

    _removeSpacing(section) {
        if (section.addedSignal) {
            section.box.disconnect(section.addedSignal);
            section.addedSignal = null;
        }

        for (const actor of section.box.get_children()) {
            const button = this._getPanelButton(actor);

            if (button)
                this._restoreButton(button);
        }
    }

    disable() {
        for (const signalId of this._settingsSignals)
            this._settings.disconnect(signalId);

        for (const section of this._sections)
            this._removeSpacing(section);

        this._settingsSignals = null;
        this._sections = null;
        this._settings = null;
    }
}