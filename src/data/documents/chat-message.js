// SPDX-FileCopyrightText: 2022 Johannes Loher
//
// SPDX-License-Identifier: MIT

import { packageId } from '../../constants.js';

export const registerChatMessageFunctionality = () => {
  Hooks.on('preCreateChatMessage', preCreateChatMessage);
};

const preCreateChatMessage = (chatMessage, data, options) => {
  const actor = ChatMessage.getSpeakerActor(chatMessage.data.speaker);
  const rollMode = actor?.getFlag(packageId, 'roll-mode');
  if (rollMode !== undefined) {
    chatMessage.applyRollMode(rollMode);
    options.rollMode = rollMode;
  }
};
