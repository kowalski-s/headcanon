import type { FocusType } from '@prisma/client';

export type TrackEventName =
  | 'feed_viewed'
  | 'feed_hero_tap'
  | 'feed_hero_read_tap'
  | 'feed_hero_watch_tap'
  | 'feed_chip_tap'
  | 'feed_card_tap'
  | 'feed_watch_chip_tap'
  | 'feed_pull_refresh'
  | 'story_viewed'
  | 'story_save_toggle'
  | 'story_share'
  | 'story_chapter_tap'
  | 'story_continue_tap'
  | 'story_watch_tap'
  | 'reader_opened'
  | 'reader_progress_milestone'
  | 'reader_settings_changed'
  | 'reader_watch_chip_tap'
  | 'reader_next_tap'
  | 'reader_chapter_completed'
  | 'reader_stream_error'
  | 'create_focus_selected'
  | 'create_character_added'
  | 'create_trope_added'
  | 'create_section_expanded'
  | 'create_advanced_skipped'
  | 'create_finished';

export interface CreateEventProps {
  create_focus_selected: { focus_type: FocusType };
  create_character_added: { source: 'suggestion' | 'custom' };
  create_trope_added: { source: 'suggestion' | 'custom' };
  create_section_expanded: { section: 'marking' | 'voice' | 'universe' | 'opening' };
  create_advanced_skipped: { fields_filled: number };
  create_finished: { took_total_ms: number; focus_type: FocusType; advanced_fields_filled: number };
}

export function track(name: TrackEventName, props?: Record<string, unknown>): void {
  // M2: подключим PostHog. Пока no-op + dev-debug.
  if (process.env.NODE_ENV !== 'production') {
    console.debug('[track]', name, props);
  }
}
