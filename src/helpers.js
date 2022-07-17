// SPDX-FileCopyrightText: 2022 Johannes Loher
//
// SPDX-License-Identifier: MIT

/**
 * @param {number} generation
 * @returns {boolean}
 */
export function isGenerationOrLater(generation) {
  return game.release.generation >= generation;
}
