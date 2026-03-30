import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import VideoPlayer from './VideoPlayer';
import React from 'react';

// Mocking Video.js
vi.mock('video.js', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      on: vi.fn(),
      one: vi.fn(),
      off: vi.fn(),
      src: vi.fn(),
      dispose: vi.fn(),
      isDisposed: vi.fn().mockReturnValue(false),
      currentTime: vi.fn().mockReturnValue(0),
      duration: vi.fn().mockReturnValue(100),
      play: vi.fn(),
      pause: vi.fn(),
      paused: vi.fn().mockReturnValue(true),
      error: vi.fn().mockReturnValue(null),
    })),
  };
});

describe('VideoPlayer', () => {
  it('renders correctly', () => {
    const { container } = render(
      <VideoPlayer src="test.mp4" lessonId={1} />
    );
    expect(container).toBeDefined();
  });
});
