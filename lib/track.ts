export type TrackEventName =
  | 'feed_viewed'
  | 'feed_hero_tap'
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
  | 'reader_chapter_completed'
  | 'reader_stream_error';

export function track(name: TrackEventName, props?: Record<string, unknown>): void {
  // M2: подключим PostHog. Пока no-op + dev-debug.
  if (process.env.NODE_ENV !== 'production') {
    console.debug('[track]', name, props);
  }
}
