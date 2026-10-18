import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class TopBarSpacingPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        this.min = 0;
        this.max = 32;
        this.def = 1;

        const settings = this.getSettings();
        const page = new Adw.PreferencesPage({title: 'Spacing', icon_name: 'preferences-desktop'});

        const spacingGroup = new Adw.PreferencesGroup({
            title: 'Spacing Between Panel Items',
            description: 'Configure the spacing between items in each top bar section. Disable a setting to restore the system default.',
        });
        const resetGroup = new Adw.PreferencesGroup({title: 'Reset Settings'});

        const leftRow = this._createScaleRow('left', settings);
        const centerRow = this._createScaleRow('center', settings);
        const rightRow = this._createScaleRow('right', settings);
        const resetRow = this._createResetButtonRow(settings);

        spacingGroup.add(leftRow);
        spacingGroup.add(centerRow);
        spacingGroup.add(rightRow);
        resetGroup.add(resetRow);

        page.add(spacingGroup);
        page.add(resetGroup);
        window.add(page);
    }

    _createScaleRow(position, settings) {
        const title =  `${position.charAt(0).toUpperCase()}${position.slice(1)} Panel`;
        const subtitle = `Spacing between items in the ${position} panel.`;
        const paddingKey = `${position}-padding`;
        const enabledKey = `${position}-padding-enabled`;

        const row = new Adw.ActionRow({title, subtitle,});
        const adjustment = new Gtk.Adjustment({lower: this.min, upper: this.max, step_increment: 1, page_increment: 4, value: settings.get_int(paddingKey)});
        const scale = new Gtk.Scale({orientation: Gtk.Orientation.HORIZONTAL, adjustment, digits: 0, draw_value: true, width_request: 200, valign: Gtk.Align.CENTER, hexpand: false});
        const toggle = new Gtk.Switch({active: settings.get_boolean(enabledKey), valign: Gtk.Align.CENTER,});

        scale.add_mark(this.def, Gtk.PositionType.BOTTOM, null);
        scale.set_value_pos(Gtk.PositionType.RIGHT);
        scale.set_sensitive(toggle.active);

        toggle.connect('notify::active', () => {
            const enabled = toggle.active;
            scale.set_sensitive(enabled);
            if (settings.get_boolean(enabledKey) !== enabled)
                settings.set_boolean(enabledKey, enabled);
        });

        scale.connect('value-changed', () => {
            const value = Math.round(scale.get_value());
            if (settings.get_int(paddingKey) !== value)
                settings.set_int(paddingKey, value);
        });

        settings.connect(`changed::${paddingKey}`, () => {
            const value = settings.get_int(paddingKey);
            if (scale.get_value() !== value)
                scale.set_value(value);
        });

        settings.connect(`changed::${enabledKey}`, () => {
            const enabled = settings.get_boolean(enabledKey);
            if (toggle.active !== enabled)
                toggle.set_active(enabled);
            scale.set_sensitive(enabled);
        });

        row.add_suffix(scale);
        row.add_suffix(toggle);
        row.set_activatable_widget(toggle);
        return row;
    }

    _createResetButtonRow(settings) {
        const title = 'Reset All Settings';
        const subtitle = 'Restore all settings to their default values.';

        const row = new Adw.ActionRow({title, subtitle});
        const button = new Gtk.Button({label: 'Reset', valign: Gtk.Align.CENTER});

        row.add_suffix(button);
        row.set_activatable_widget(button);

        button.connect('clicked', () => {
            settings.reset('left-padding'); settings.reset('left-padding-enabled');
            settings.reset('center-padding'); settings.reset('center-padding-enabled');
            settings.reset('right-padding'); settings.reset('right-padding-enabled');
        });

        return row;
    }
}