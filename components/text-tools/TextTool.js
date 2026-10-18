'use client';
/* Dispatcher: registry entries with `customComponent` render here instead
   of the generic ToolRunner (text tools need textareas, meters, copy
   buttons — richer UI than the number-input calculator shell). */
import CharacterCounter from './CharacterCounter';
import WordCounter from './WordCounter';
import CaseConverter from './CaseConverter';

const MAP = {
  'character-counter': CharacterCounter,
  'word-counter': WordCounter,
  'case-converter': CaseConverter,
};

export default function TextTool({ component, lang = 'en' }) {
  const C = MAP[component];
  if (!C) return null;
  return <C lang={lang} />;
}
