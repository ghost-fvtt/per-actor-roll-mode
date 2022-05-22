// SPDX-FileCopyrightText: 2022 Johannes Loher
//
// SPDX-License-Identifier: MIT

import { packageId } from '../../constants.js';

export const registerActorSheetFunctionality = () => {
  Hooks.on('getActorSheetHeaderButtons', getActorSheetHeaderButtons);
};

const getActorSheetHeaderButtons = (actorSheet, buttons) => {
  const rollMode = actorSheet.actor.getFlag(packageId, 'roll-mode');
  buttons.unshift({
    label: getLabelForRollMode(rollMode),
    class: 'roll-mode',
    icon: 'fas fa-dice-d20',
    onclick: () => {
      const actorRollModeConfig =
        Object.values(actorSheet.actor.apps).find((app) => app instanceof ActorRollModeConfig) ??
        new ActorRollModeConfig(actorSheet.actor);
      actorRollModeConfig.render(true);
    },
  });
};

const getLabelForRollMode = (rollMode) =>
  rollMode !== undefined ? { ...CONFIG.Dice.rollModes }[rollMode] : 'PER_ACTOR_ROLL_MODE.RollMode';

class ActorRollModeConfig extends FormApplication {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['actor-roll-mode-config'],
      template: `modules/per-actor-roll-mode/templates/actor-roll-mode-config.hbs`,
      width: 480,
      height: 'auto',
    });
  }

  get id() {
    return `actor-roll-mode-config-${this.object.id}`;
  }

  get title() {
    return `${this.object.name}: ${game.i18n.localize('PER_ACTOR_ROLL_MODE.RollModeOverride')}`;
  }

  async getData() {
    const rollMode = this.object.getFlag(packageId, 'roll-mode') ?? 'unset';

    return {
      rollMode,
      data: this.object.data,
      rollModes: { unset: 'PER_ACTOR_ROLL_MODE.RollUnset', ...CONFIG.Dice.rollModes },
    };
  }

  async render(force, options = {}) {
    if (!this.object.compendium && !this.object.testUserPermission(game.user, this.options.viewPermission)) {
      if (!force) return this; // If rendering is not being forced, fail silently
      const err = game.i18n.localize('SHEETS.DocumentSheetPrivate');
      ui.notifications.warn(err);
      console.warn(err);
      return this;
    }

    // Update editable permission
    options.editable = options.editable ?? this.object.isOwner;

    // Register the active Application with the referenced Documents
    this.object.apps[this.appId] = this;
    return super.render(force, options);
  }

  async close(options = {}) {
    await super.close(options);
    delete this.object.apps[this.appId];
  }

  async _updateObject(event, formData) {
    let rollMode = formData['flags.per-actor-roll-mode.roll-mode'];
    if (formData['flags.per-actor-roll-mode.roll-mode'] === 'unset') {
      delete formData['flags.per-actor-roll-mode.roll-mode'];
      formData['flags.per-actor-roll-mode.-=roll-mode'] = null;
      rollMode = undefined;
    }
    const actor = await this.object.update(formData);
    actor.sheet?._element
      ?.find('.header-button.roll-mode')
      .html(`<i class="fas fa-dice-d20"></i>${game.i18n.localize(getLabelForRollMode(rollMode))}`);
    return actor;
  }
}
