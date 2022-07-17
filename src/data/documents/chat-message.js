// SPDX-FileCopyrightText: 2022 Johannes Loher
//
// SPDX-License-Identifier: MIT

import { packageId } from '../../constants.js';
import { isGenerationOrLater } from '../../helpers.js';

export const registerChatMessageFunctionality = () => {
  Hooks.on('preCreateChatMessage', preCreateChatMessage);
};

const preCreateChatMessage = (chatMessage, data, options) => {
  const actor = ChatMessage.getSpeakerActor(getSpeakerFromChatMessage(chatMessage));
  const rollMode = actor?.getFlag(packageId, 'roll-mode');
  if (rollMode !== undefined) {
    chatMessage.applyRollMode(rollMode);
    options.rollMode = rollMode;
  }
};

const getSpeakerFromChatMessage = (chatMessage) => {
  return isGenerationOrLater(10) ? chatMessage.speaker : chatMessage.data.speaker;
};
