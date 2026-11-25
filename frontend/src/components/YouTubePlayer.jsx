import { useState, useRef, useEffect, useCallback } from 'react';
import Icon from './Icon.jsx';
import { extractYoutubeId } from '../lib/youtube.js';
import { formatTime } from '../lib/time.js';

const fmtTime = formatTime;

/**
 * Premium GramGuru Custom YouTube Player Component.
 * - Solid top black shield conceals YouTube thumbnail, raw video title & channel avatar.
 * - Clean custom GramGuru controls bar (Play/Pause, 10s skip/rewind, timer, volume, CC, fullscreen, GramGuru badge).
 * - Full interactive scrubbing: click or drag the timeline to seek anywhere smoothly.
 * - Pure YouTube API state sync: timer strictly tracks live video playback without artificial drift.
 * - Full lifecycle management with container-based window.YT.Player instantiation.
 */
export default function YouTubePlayer({
  videoUrl,
  videoId: propVideoId,
  title = 'Course Video Lesson',
  courseName = '',
  className = '',
  autoPlay = false,
  checkpoints = [],
  completedCheckpoints = {},
  onCheckpointSelect,
  onTimeUpdate,
  onDurationChange,
  onVideoEnded,
  onSeekingOrSeeked,
  onPlay,
  onPause,
  playerRef,
  initialSeekTime = 0,
  onSkipToNext = null,
  duration: propDuration = 0,
  strictNonSkippable = false,
  initialMaxWatched = 0,
  onSkipBlocked = null,
}) {
  const maxWatchedRef = useRef(
    Math.max(Number(initialMaxWatched) || 0, Number(initialSeekTime) || 0)
  );
  const lastSkipToastAtRef = useRef(0);

  useEffect(() => {
    const floor = Math.max(Number(initialMaxWatched) || 0, Number(initialSeekTime) || 0);
    if (floor > maxWatchedRef.current) {
      maxWatchedRef.current = floor;
    }
  }, [initialMaxWatched, initialSeekTime]);

  useEffect(() => {
    maxWatchedRef.current = Math.max(Number(initialMaxWatched) || 0, Number(initialSeekTime) || 0);
  }, [propVideoId, videoUrl]);
  const containerRef = useRef(null);
  const barRef = useRef(null);
  const playerMountRef = useRef(null);
  const ytPlayerRefInternal = useRef(null);
  const currentTimeRef = useRef(0);
  const durationRef = useRef(typeof propDuration === 'number' && propDuration > 0 ? propDuration : 0);
  const isPlayingRef = useRef(false);
  const isSeekingRef = useRef(false);
  const isDraggingRef = useRef(false);
  const wasPlayingBeforeSeekRef = useRef(false);
  const pendingSeekTargetRef = useRef(null);
  const seekSafetyTimeoutRef = useRef(null);
  const rapidSeekTimeoutRef = useRef(null);
  const targetSeekTimeRef = useRef(null);
  const hasInitialSeekedRef = useRef(false);
  const autoplayWatchdogRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(() => (typeof propDuration === 'number' && propDuration > 0 ? propDuration : 0));
  const [bufferedPct, setBufferedPct] = useState(0);
  const [hoverPct, setHoverPct] = useState(null);
  const [hoverTime, setHoverTime] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isUserSeeking, setIsUserSeeking] = useState(false);
  const [isCaptionsOn, setIsCaptionsOn] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  // Sync prop duration when available
  useEffect(() => {
    if (typeof propDuration === 'number' && propDuration > 0 && durationRef.current <= 0) {
      durationRef.current = propDuration;
      setDuration(propDuration);
    }
  }, [propDuration]);

  // Keep latest callback references in refs so listeners don't re-subscribe on re-renders
  const onTimeUpdateRef = useRef(onTimeUpdate);
  const onDurationChangeRef = useRef(onDurationChange);
  const onVideoEndedRef = useRef(onVideoEnded);
  const onSeekingOrSeekedRef = useRef(onSeekingOrSeeked);
  const onPlayRef = useRef(onPlay);
  const onPauseRef = useRef(onPause);

  useEffect(() => {
    onTimeUpdateRef.current = onTimeUpdate;
    onDurationChangeRef.current = onDurationChange;
    onVideoEndedRef.current = onVideoEnded;
    onSeekingOrSeekedRef.current = onSeekingOrSeeked;
    onPlayRef.current = onPlay;
    onPauseRef.current = onPause;
  });

  const resolvedVideoId = propVideoId || extractYoutubeId(videoUrl);
  const iframeId = `gg-yt-iframe-${resolvedVideoId || 'default'}`;

  // Update time helper (always uses actual player time)
  const handleTimeProgress = useCallback((cur) => {
    if (typeof cur !== 'number' || isNaN(cur) || cur < 0) return;
    if (isDraggingRef.current || isSeekingRef.current) return;

    currentTimeRef.current = cur;
    setCurrentTime(cur);

    if (onTimeUpdateRef.current) {
      onTimeUpdateRef.current(cur);
    }
  }, []);

  // Update duration helper
  const handleDurationKnown = useCallback((dur) => {
    if (typeof dur !== 'number' || isNaN(dur) || dur <= 0) return;
    durationRef.current = dur;
    setDuration(dur);
    if (onDurationChangeRef.current) {
      onDurationChangeRef.current(dur);
    }
  }, []);

  // Execute final seek to target position
  const commitSeek = useCallback((targetTime, shouldResume) => {
    const dur = durationRef.current || duration || 99999;
    const clamped = Math.max(0, Math.min(targetTime, dur));

    if (seekSafetyTimeoutRef.current) {
      clearTimeout(seekSafetyTimeoutRef.current);
      seekSafetyTimeoutRef.current = null;
    }

    isSeekingRef.current = true;
    setIsUserSeeking(true);
    pendingSeekTargetRef.current = clamped;
    wasPlayingBeforeSeekRef.current = shouldResume;

    currentTimeRef.current = clamped;
    setCurrentTime(clamped);

    if (onSeekingOrSeekedRef.current) {
      onSeekingOrSeekedRef.current(clamped);
    }
    if (onTimeUpdateRef.current) {
      onTimeUpdateRef.current(clamped);
    }

    const player = ytPlayerRefInternal.current;
    if (player) {
      try {
        if (typeof player.seekTo === 'function') {
          player.seekTo(clamped, true);
        }
      } catch { }

      if (shouldResume) {
        try {
          if (typeof player.playVideo === 'function') {
            player.playVideo();
          }
        } catch { }
        isPlayingRef.current = true;
        setIsPlaying(true);
      }
    }

    // Safety watchdog: clear seeking locks after 700ms
    seekSafetyTimeoutRef.current = setTimeout(() => {
      isSeekingRef.current = false;
      setIsUserSeeking(false);
      setIsBuffering(false);
      pendingSeekTargetRef.current = null;
    }, 700);
  }, [duration]);

  // General seek handler used by external callers (e.g. playerRef.current.seekTo)
  const handleSeek = useCallback((newTime) => {
    commitSeek(newTime, isPlayingRef.current);
  }, [commitSeek]);

  // Debounced rapid relative seek handler for +10s / -10s buttons
  const handleSeekRelative = useCallback((delta) => {
    const dur = durationRef.current || duration || 99999;
    const baseTime = targetSeekTimeRef.current !== null ? targetSeekTimeRef.current : currentTimeRef.current;
    const nextTarget = Math.max(0, Math.min(dur, baseTime + delta));
    targetSeekTimeRef.current = nextTarget;

    // Update UI immediately so rapid clicking feels instant
    currentTimeRef.current = nextTarget;
    setCurrentTime(nextTarget);
    setIsUserSeeking(true);

    if (rapidSeekTimeoutRef.current) {
      clearTimeout(rapidSeekTimeoutRef.current);
    }

    const wasPlaying = isPlayingRef.current;
    rapidSeekTimeoutRef.current = setTimeout(() => {
      const finalTarget = targetSeekTimeRef.current;
      targetSeekTimeRef.current = null;
      commitSeek(finalTarget, wasPlaying);
    }, 150);
  }, [duration, commitSeek]);

  const togglePlayPause = () => {
    const player = ytPlayerRefInternal.current;
    if (isPlaying) {
      isPlayingRef.current = false;
      setIsPlaying(false);
      if (player?.pauseVideo) {
        try { player.pauseVideo(); } catch { }
      }
      if (onPauseRef.current) onPauseRef.current();
    } else {
      isPlayingRef.current = true;
      setIsPlaying(true);
      setIsBuffering(false);
      if (player?.playVideo) {
        try { player.playVideo(); } catch { }
      }
      if (onPlayRef.current) onPlayRef.current();
    }
  };

  const toggleMute = () => {
    const player = ytPlayerRefInternal.current;
    if (isMuted) {
      setIsMuted(false);
      try { player?.unMute?.(); } catch { }
    } else {
      setIsMuted(true);
      try { player?.mute?.(); } catch { }
    }
  };

  const handleVolumeChange = (newVol) => {
    setVolume(newVol);
    if (newVol > 0 && isMuted) setIsMuted(false);
    try {
      ytPlayerRefInternal.current?.setVolume?.(newVol);
    } catch { }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => { });
    } else {
      document.exitFullscreen?.().catch(() => { });
    }
  };

  const toggleCaptions = () => {
    const next = !isCaptionsOn;
    setIsCaptionsOn(next);
    try {
      const player = ytPlayerRefInternal.current;
      if (player) {
        if (typeof player.loadModule === 'function') player.loadModule('captions');
        if (typeof player.setOption === 'function') player.setOption('captions', 'track', next ? { languageCode: 'en' } : {});
        if (typeof player.setOption === 'function') player.setOption('captions', 'reload', true);
      }
    } catch { }
  };

  // Expose player controls to parent component via playerRef
  useEffect(() => {
    if (playerRef) {
      playerRef.current = {
        pauseVideo: () => {
          isPlayingRef.current = false;
          setIsPlaying(false);
          try { ytPlayerRefInternal.current?.pauseVideo?.(); } catch { }
        },
        playVideo: () => {
          isPlayingRef.current = true;
          setIsPlaying(true);
          try { ytPlayerRefInternal.current?.playVideo?.(); } catch { }
        },
        seekTo: (seconds) => {
          commitSeek(seconds, isPlayingRef.current);
        },
        getCurrentTime: () => currentTimeRef.current,
        getDuration: () => durationRef.current || duration,
      };
    }
  }, [playerRef, commitSeek, duration]);

  // Load YouTube IFrame API script tag once in document.head
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.YT) {
      const existing = document.getElementById('youtube-iframe-api-tag');
      if (!existing) {
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api-tag';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
      }
    }
  }, []);

  // Poll actual YouTube player currentTime & sync play/pause status every 200ms
  useEffect(() => {
    let isMounted = true;
    const syncInterval = setInterval(() => {
      if (!isMounted) return;
      if (isDraggingRef.current || isSeekingRef.current) return;

      const player = ytPlayerRefInternal.current;
      if (!player) return;

      try {
        // 1. Sync play/pause state from player
        if (typeof player.getPlayerState === 'function') {
          const state = player.getPlayerState();
          if (state === 1) {
            // PLAYING
            if (!isPlayingRef.current) {
              isPlayingRef.current = true;
              setIsPlaying(true);
            }
            setIsBuffering(false);
          } else if (state === 2) {
            // PAUSED
            if (isPlayingRef.current) {
              isPlayingRef.current = false;
              setIsPlaying(false);
            }
            setIsBuffering(false);
          } else if (state === 3) {
            // BUFFERING
            setIsBuffering(true);
          } else if (state === 0) {
            // ENDED
            if (isPlayingRef.current) {
              isPlayingRef.current = false;
              setIsPlaying(false);
            }
            setIsBuffering(false);
          }
        }

        // 2. Sync Duration if unknown or changed
        if (typeof player.getDuration === 'function') {
          const d = player.getDuration();
          if (typeof d === 'number' && !isNaN(d) && d > 0 && Math.abs(d - durationRef.current) > 1) {
            handleDurationKnown(d);
          }
        }

        // 3. Sync Buffered Fraction
        if (typeof player.getVideoLoadedFraction === 'function') {
          const frac = player.getVideoLoadedFraction();
          if (typeof frac === 'number' && !isNaN(frac) && frac >= 0) {
            setBufferedPct(Math.round(frac * 100));
          }
        }

        // 3b. Cap playback rate at <= 1.5x when strictNonSkippable is active
        if (strictNonSkippable && typeof player.getPlaybackRate === 'function' && typeof player.setPlaybackRate === 'function') {
          try {
            const rate = player.getPlaybackRate();
            if (typeof rate === 'number' && rate > 1.5) {
              player.setPlaybackRate(1.5);
            }
          } catch { }
        }

        // 4. Sync Current Time strictly from player instance
        if (typeof player.getCurrentTime === 'function') {
          const actual = player.getCurrentTime();
          if (typeof actual === 'number' && !isNaN(actual) && actual >= 0) {
            if (strictNonSkippable && actual > maxWatchedRef.current + 5) {
              try {
                if (typeof player.seekTo === 'function') {
                  player.seekTo(maxWatchedRef.current, true);
                }
              } catch { }
              const nowMs = Date.now();
              if (nowMs - lastSkipToastAtRef.current > 2000) {
                lastSkipToastAtRef.current = nowMs;
                if (typeof onSkipBlocked === 'function') {
                  onSkipBlocked(maxWatchedRef.current);
                }
              }
              return;
            }
            if (actual > maxWatchedRef.current) {
              maxWatchedRef.current = actual;
            }
            handleTimeProgress(actual);
          }
        }
      } catch { }
    }, 200);

    return () => {
      isMounted = false;
      clearInterval(syncInterval);
    };
  }, [handleTimeProgress, handleDurationKnown]);

  // Instantiate YT.Player inside playerMountRef container
  useEffect(() => {
    if (!resolvedVideoId) return;

    let isMounted = true;
    let checkInterval = null;

    const createPlayer = () => {
      if (!isMounted || !playerMountRef.current) return;
      if (!window.YT || !window.YT.Player) return;

      const origin = typeof window !== 'undefined' && window.location ? window.location.origin : '';

      try {
        const player = new window.YT.Player(playerMountRef.current, {
          videoId: resolvedVideoId,
          playerVars: {
            enablejsapi: 1,
            origin: origin || undefined,
            rel: 0,
            modestbranding: 1,
            controls: 0,
            disablekb: 1,
            iv_load_policy: 3,
            playsinline: 1,
            fs: 0,
            autoplay: autoPlay ? 1 : 0,
            start: initialSeekTime > 0 ? Math.floor(initialSeekTime) : 0,
            cc_lang_pref: 'en',
            cc_load_policy: 1,
          },
          events: {
            onReady: (event) => {
              if (!isMounted) return;
              ytPlayerRefInternal.current = event.target;

              const iframe = typeof event.target.getIframe === 'function' ? event.target.getIframe() : null;
              if (iframe) {
                iframe.className = 'w-full h-full border-0 absolute inset-0 pointer-events-none select-none';
                iframe.style.pointerEvents = 'none';
                try {
                  iframe.contentWindow?.postMessage(JSON.stringify({ event: 'listening', id: event.target.id }), '*');
                } catch { }
              }

              const dur = event.target.getDuration?.();
              if (typeof dur === 'number' && dur > 0) {
                handleDurationKnown(dur);
              }

              if (initialSeekTime > 0 && !hasInitialSeekedRef.current) {
                hasInitialSeekedRef.current = true;
                try {
                  event.target.seekTo(initialSeekTime, true);
                  currentTimeRef.current = initialSeekTime;
                  setCurrentTime(initialSeekTime);
                } catch { }
              }

              if (autoPlay) {
                try {
                  event.target.playVideo();
                } catch { }
                if (autoplayWatchdogRef.current) clearTimeout(autoplayWatchdogRef.current);
                autoplayWatchdogRef.current = setTimeout(() => {
                  if (isMounted && !isPlayingRef.current) {
                    setAutoplayBlocked(true);
                  }
                }, 1800);
              }
            },
            onStateChange: (event) => {
              if (!isMounted) return;
              const state = event.data;
              const player = event.target;
              try {
                const cur = typeof player.getCurrentTime === 'function' ? player.getCurrentTime() : null;
                const dur = typeof player.getDuration === 'function' ? player.getDuration() : null;
                if (typeof dur === 'number' && dur > 0) handleDurationKnown(dur);

                if (state === 3) {
                  // YT.PlayerState.BUFFERING
                  setIsBuffering(true);
                } else if (state === 1) {
                  // YT.PlayerState.PLAYING
                  if (autoplayWatchdogRef.current) {
                    clearTimeout(autoplayWatchdogRef.current);
                    autoplayWatchdogRef.current = null;
                  }
                  setAutoplayBlocked(false);
                  setIsBuffering(false);
                  isSeekingRef.current = false;
                  setIsUserSeeking(false);
                  pendingSeekTargetRef.current = null;
                  isPlayingRef.current = true;
                  setIsPlaying(true);
                  if (typeof cur === 'number' && cur >= 0) {
                    currentTimeRef.current = cur;
                    setCurrentTime(cur);
                    if (onTimeUpdateRef.current) onTimeUpdateRef.current(cur);
                  }
                  if (onPlayRef.current) onPlayRef.current();
                } else if (state === 2) {
                  // YT.PlayerState.PAUSED
                  setIsBuffering(false);
                  isSeekingRef.current = false;
                  setIsUserSeeking(false);
                  pendingSeekTargetRef.current = null;
                  isPlayingRef.current = false;
                  setIsPlaying(false);
                  if (typeof cur === 'number' && cur >= 0) {
                    currentTimeRef.current = cur;
                    setCurrentTime(cur);
                    if (onTimeUpdateRef.current) onTimeUpdateRef.current(cur);
                  }
                  if (onPauseRef.current) onPauseRef.current();
                } else if (state === 0) {
                  // YT.PlayerState.ENDED
                  setIsBuffering(false);
                  isSeekingRef.current = false;
                  setIsUserSeeking(false);
                  pendingSeekTargetRef.current = null;
                  isPlayingRef.current = false;
                  setIsPlaying(false);
                  if (onVideoEndedRef.current) onVideoEndedRef.current();
                }
              } catch { }
            },
            onError: () => {
              if (isMounted) setLoadError(true);
            },
          },
        });
        ytPlayerRefInternal.current = player;
      } catch (err) {
        console.warn('YT Player init notice:', err);
      }
    };

    if (window.YT && window.YT.Player) {
      createPlayer();
    } else {
      checkInterval = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(checkInterval);
          checkInterval = null;
          createPlayer();
        }
      }, 100);
    }

    return () => {
      isMounted = false;
      if (checkInterval) clearInterval(checkInterval);
      if (autoplayWatchdogRef.current) clearTimeout(autoplayWatchdogRef.current);
      if (seekSafetyTimeoutRef.current) clearTimeout(seekSafetyTimeoutRef.current);
      if (rapidSeekTimeoutRef.current) clearTimeout(rapidSeekTimeoutRef.current);

      if (ytPlayerRefInternal.current) {
        try {
          ytPlayerRefInternal.current.stopVideo?.();
          ytPlayerRefInternal.current.destroy?.();
        } catch { }
        ytPlayerRefInternal.current = null;
      }
    };
  }, [resolvedVideoId, autoPlay, initialSeekTime, handleDurationKnown]);

  // Fullscreen event listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  if (!resolvedVideoId) {
    return (
      <div
        className={`w-full aspect-video bg-gradient-to-br from-[#EFF6FF] via-white to-indigo-50 rounded-2xl flex flex-col items-center justify-center text-center p-6 text-[#0F172A] border border-slate-200 shadow-sm ${className}`}
      >
        <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mb-3">
          <Icon name="play_disabled" className="text-3xl text-amber-600" />
        </div>
        <h3 className="font-extrabold text-lg text-[#0F172A] mb-1">No Video Available</h3>
        <p className="text-[#475569] text-xs max-w-md">
          A valid YouTube video has not yet been linked to this lesson. Please contact the administrator.
        </p>
      </div>
    );
  }

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative w-full aspect-video bg-[#000000] rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center select-none group ${className}`}
    >
      {loadError ? (
        <div className="flex flex-col items-center justify-center text-center p-6 text-white max-w-md z-30">
          <Icon name="error_outline" className="text-4xl text-amber-400 mb-2" />
          <h4 className="font-bold text-base mb-1">Unable to Load Video Embed</h4>
          <p className="text-xs text-gray-300 mb-4">
            The video may be restricted or blocked from embedding.
          </p>
          {onSkipToNext && (
            <button
              type="button"
              onClick={onSkipToNext}
              className="px-4 py-2 rounded-xl bg-brand-forest hover:bg-brand-deep text-brand-lime font-bold text-xs flex items-center gap-2 transition active:scale-95 shadow-md cursor-pointer"
            >
              <span>Skip to Next Video</span>
              <Icon name="arrow_forward" className="text-sm" />
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Target container where YT.Player mounts */}
          <div className="w-full h-full absolute inset-0 overflow-hidden pointer-events-none select-none">
            <div
              ref={playerMountRef}
              id={iframeId}
              className="w-full h-full border-0 absolute inset-0 pointer-events-none select-none"
            />
          </div>

          {/* Autoplay Blocked Fallback Overlay */}
          {autoplayBlocked && (
            <div className="absolute inset-0 z-25 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center animate-fade-in">
              <div className="max-w-sm bg-zinc-900/95 border border-white/20 rounded-2xl p-5 shadow-2xl flex flex-col items-center">
                <Icon name="play_circle" className="text-4xl text-brand-lime mb-2 animate-pulse" />
                <p className="text-white text-xs sm:text-sm font-semibold mb-3">
                  Autoplay paused by browser. Click to start the next video:
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setAutoplayBlocked(false);
                    try {
                      ytPlayerRefInternal.current?.playVideo?.();
                    } catch { }
                    setIsPlaying(true);
                    isPlayingRef.current = true;
                  }}
                  className="px-5 py-2.5 rounded-xl bg-brand-forest hover:bg-brand-deep text-brand-lime font-black text-xs sm:text-sm flex items-center gap-2 transition shadow-lg active:scale-95 cursor-pointer"
                >
                  <Icon name="play_arrow" className="text-base" />
                  <span>Play Next Video</span>
                </button>
              </div>
            </div>
          )}

          {/* Click-to-Toggle Play/Pause Overlay: covers video area with z-10 */}
          <div
            className="absolute inset-0 z-10 cursor-pointer"
            onClick={togglePlayPause}
            aria-label={isPlaying ? 'Pause Video' : 'Play Video'}
          />

          {/* Bottom Bar Shield: Conceals YouTube bottom branding/controls behind custom controls */}
          <div className="absolute bottom-0 inset-x-0 h-16 sm:h-20 bg-black/95 z-15 pointer-events-none" />

          {/* Top Bar Shield: 100% SOLID BLACK (#000000) completely conceals YouTube thumbnail, video title & channel avatar */}
          <div className="absolute top-0 inset-x-0 h-16 bg-[#000000] border-b border-white/10 z-20 px-4 flex items-center justify-between pointer-events-none select-none shadow-2xl">
            <div className="flex items-center gap-2.5 min-w-0 pr-12">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-forest to-emerald-600 flex items-center justify-center shrink-0 border border-white/20 shadow-md">
                <Icon name="smart_display" className="text-white text-base" />
              </div>
              <div className="min-w-0">
                <h3 className="text-white font-extrabold text-sm sm:text-base leading-tight truncate">
                  {title || 'Course Video Lesson'}
                </h3>
                <div className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5 mt-0.5">
                  <span>G-Mark Software Classroom</span>
                  {courseName && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-300 truncate max-w-xs">{courseName}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 border border-white/15 text-gray-200 text-xs font-bold shadow-inner">
              <Icon name="verified" className="text-emerald-400 text-sm" />
              <span>Official Lesson</span>
            </div>
          </div>

          {/* Big Center Play Button (visible ONLY when paused and not buffering) */}
          {!isPlaying && !isBuffering && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                togglePlayPause();
              }}
              className="absolute z-20 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-500/90 hover:bg-emerald-400 text-white flex items-center justify-center shadow-2xl backdrop-blur-md cursor-pointer transition-all duration-200 transform hover:scale-110 active:scale-95"
              aria-label="Play Video"
            >
              <Icon name="play_arrow" className="text-4xl sm:text-5xl ml-1 text-white" />
            </div>
          )}

          {/* Buffering / Loading Indicator */}
          {isBuffering && !isUserSeeking && !isDraggingRef.current && (
            <div className="absolute inset-0 z-25 flex flex-col items-center justify-center pointer-events-none">
              <div className="px-4 py-2.5 rounded-2xl bg-black/85 backdrop-blur-md border border-white/15 shadow-2xl flex items-center gap-2.5 text-white animate-in fade-in duration-150">
                <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-bold tracking-wide text-gray-200">Loading...</span>
              </div>
            </div>
          )}

          {/* Bottom Custom GramGuru Controls Bar */}
          <div
            className={`absolute bottom-0 inset-x-0 z-20 bg-gradient-to-t from-black via-black/95 to-black/60 px-4 pt-6 pb-3 flex flex-col gap-2 transition-opacity duration-300 ${isPlaying && !isHovered && !isUserSeeking && !isDraggingRef.current ? 'opacity-0 hover:opacity-100' : 'opacity-100'
              }`}
          >
            {/* Interactive Progress Bar with Scrubber Knob & Live Tooltip */}
            <div
              ref={barRef}
              className="relative w-full h-6 flex items-center cursor-pointer group/bar touch-none select-none py-2"
              onPointerDown={(e) => {
                e.preventDefault();
                const bar = barRef.current || e.currentTarget;
                const dur = durationRef.current || duration || 0;
                if (dur <= 0) return;

                const wasPlaying = isPlayingRef.current;
                wasPlayingBeforeSeekRef.current = wasPlaying;
                isDraggingRef.current = true;
                setIsUserSeeking(true);

                try {
                  e.currentTarget.setPointerCapture(e.pointerId);
                } catch { }

                const calcTime = (clientX) => {
                  const currentRect = bar.getBoundingClientRect();
                  const ratio = Math.max(0, Math.min(1, (clientX - currentRect.left) / currentRect.width));
                  return { time: ratio * dur, pct: ratio * 100 };
                };

                const initial = calcTime(e.clientX);
                let latestTarget = initial.time;
                currentTimeRef.current = initial.time;
                setCurrentTime(initial.time);
                setHoverPct(Math.round(initial.pct * 10) / 10);
                setHoverTime(initial.time);

                const onPointerMove = (ev) => {
                  ev.preventDefault();
                  const { time, pct } = calcTime(ev.clientX);
                  latestTarget = time;
                  currentTimeRef.current = time;
                  setCurrentTime(time);
                  setHoverPct(Math.round(pct * 10) / 10);
                  setHoverTime(time);
                };

                const onPointerUp = (ev) => {
                  try {
                    ev.currentTarget?.releasePointerCapture?.(ev.pointerId);
                  } catch { }
                  window.removeEventListener('pointermove', onPointerMove);
                  window.removeEventListener('pointerup', onPointerUp);
                  isDraggingRef.current = false;
                  setHoverPct(null);
                  commitSeek(latestTarget, wasPlaying);
                };

                window.addEventListener('pointermove', onPointerMove);
                window.addEventListener('pointerup', onPointerUp);
              }}
              onPointerMove={(e) => {
                if (isDraggingRef.current) return;
                const bar = barRef.current || e.currentTarget;
                const dur = durationRef.current || duration || 0;
                if (dur <= 0) return;
                const rect = bar.getBoundingClientRect();
                const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                setHoverPct(Math.round(ratio * 1000) / 10);
                setHoverTime(ratio * dur);
              }}
              onPointerLeave={() => {
                if (!isDraggingRef.current) {
                  setHoverPct(null);
                }
              }}
            >
              {/* Hover Timestamp Floating Tooltip */}
              {hoverPct !== null && (
                <div
                  className="absolute -top-6 -translate-x-1/2 px-2 py-0.5 rounded-md bg-black/95 text-white text-[11px] font-mono font-bold border border-white/20 shadow-xl pointer-events-none whitespace-nowrap z-30 transition-all duration-75"
                  style={{ left: `${hoverPct}%` }}
                >
                  {fmtTime(hoverTime)}
                </div>
              )}

              {/* Background Track with expansion on hover/scrub */}
              <div className="relative w-full h-1.5 group-hover/bar:h-2.5 transition-[height] duration-150 bg-white/20 rounded-full overflow-hidden">
                {/* Buffered Video Bar */}
                {bufferedPct > 0 && (
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-white/30 rounded-full pointer-events-none transition-[width] duration-300"
                    style={{ width: `${Math.min(100, Math.max(0, bufferedPct))}%` }}
                  />
                )}

                {/* Hover Ghost Highlight Track */}
                {hoverPct !== null && (
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-white/20 rounded-full pointer-events-none"
                    style={{ width: `${hoverPct}%` }}
                  />
                )}

                {/* Played Progress Gradient Track */}
                <div
                  className={`absolute left-0 top-0 bottom-0 bg-gradient-to-r from-emerald-500 to-brand-lime rounded-full pointer-events-none ${isUserSeeking ? 'transition-none' : 'transition-[width] duration-150 ease-linear'
                    }`}
                  style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
                />
              </div>

              {/* Checkpoint Indicators on Timeline */}
              {duration > 0 &&
                Array.isArray(checkpoints) &&
                checkpoints.map((cp) => {
                  if (!cp || typeof cp.seconds !== 'number' || cp.seconds <= 0 || cp.isEnd) return null;
                  const cpPct = Math.min(100, Math.max(0, (cp.seconds / duration) * 100));
                  const isCompleted = !!completedCheckpoints?.[cp.id];
                  return (
                    <div
                      key={cp.id || `cp-${cp.seconds}`}
                      onClick={(ev) => {
                        ev.stopPropagation();
                        if (onCheckpointSelect) {
                          onCheckpointSelect(cp);
                        } else {
                          handleSeek(cp.seconds);
                        }
                      }}
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full z-15 group/cp cursor-pointer"
                      style={{ left: `${cpPct}%` }}
                      title={cp.label || `Checkpoint at ${fmtTime(cp.seconds)}`}
                    >
                      <div
                        className={`w-full h-full rounded-full border border-black/60 shadow-sm transition-transform duration-150 group-hover/cp:scale-150 ${isCompleted
                            ? 'bg-emerald-400'
                            : 'bg-amber-400 ring-2 ring-amber-400/50'
                          }`}
                      />
                    </div>
                  );
                })}

              {/* Scrubber Knob (Thumb) with smooth scaling on hover/scrub */}
              <div
                className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-lg border-2 border-emerald-500 pointer-events-none z-20 ${isUserSeeking || isDraggingRef.current
                    ? 'scale-125 ring-4 ring-emerald-500/30 transition-none'
                    : 'scale-100 group-hover/bar:scale-125 transition-[left] duration-150 ease-linear'
                  }`}
                style={{ left: `${Math.min(100, Math.max(0, progressPct))}%` }}
              />
            </div>

            {/* Bottom Row: Controls & Badges */}
            <div className="flex items-center justify-between text-white text-xs font-semibold gap-2">
              {/* Left Group: Play/Pause, Replay 10, Forward 10, Time */}
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={togglePlayPause}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition active:scale-95 cursor-pointer"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  <Icon name={isPlaying ? 'pause' : 'play_arrow'} className="text-xl" />
                </button>

                <button
                  type="button"
                  onClick={() => handleSeekRelative(-10)}
                  className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-gray-300 hover:text-white transition active:scale-95 cursor-pointer"
                  title="Rewind 10 seconds"
                >
                  <Icon name="replay_10" className="text-lg" />
                </button>

                <button
                  type="button"
                  onClick={() => handleSeekRelative(10)}
                  className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-gray-300 hover:text-white transition active:scale-95 cursor-pointer"
                  title="Forward 10 seconds"
                >
                  <Icon name="forward_10" className="text-lg" />
                </button>

                <div className="text-xs font-mono font-bold text-gray-300 ml-1">
                  <span className="text-emerald-400">{fmtTime(currentTime)}</span>
                  <span className="text-gray-500 mx-1">/</span>
                  <span>{fmtTime(duration)}</span>
                </div>
              </div>

              {/* Right Group: Volume, Subtitles, Fullscreen, GramGuru Brand */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Volume Slider */}
                <div className="hidden sm:flex items-center gap-1.5 group/vol">
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-gray-300 hover:text-white transition cursor-pointer"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    <Icon name={isMuted || volume === 0 ? 'volume_off' : volume > 50 ? 'volume_up' : 'volume_down'} className="text-base" />
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                    className="w-14 h-1 bg-white/20 rounded-full appearance-none accent-emerald-500 cursor-pointer"
                  />
                </div>

                {/* Subtitles / Closed Captions Toggle */}
                <button
                  type="button"
                  onClick={toggleCaptions}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition active:scale-95 cursor-pointer ${isCaptionsOn
                      ? 'bg-emerald-500/25 text-emerald-400 border border-emerald-500/40 shadow-sm'
                      : 'bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white'
                    }`}
                  title={isCaptionsOn ? 'Subtitles On (Click to turn off)' : 'Subtitles Off (Click to turn on)'}
                >
                  <span className="text-[10px] font-black tracking-tight leading-none px-1 py-0.5 border border-current rounded">
                    CC
                  </span>
                </button>

                {/* Fullscreen Button */}
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition active:scale-95 cursor-pointer"
                  title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                >
                  <Icon name={isFullscreen ? 'fullscreen_exit' : 'fullscreen'} className="text-xl" />
                </button>

                {/* GramGuru Brand Badge */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/10 border border-white/15 text-white">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[11px] font-black tracking-wider text-white">
                    <span className="text-emerald-400">Gram</span>Guru
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
