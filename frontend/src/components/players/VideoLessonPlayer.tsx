import React, { useRef } from 'react';
import ReactPlayer from 'react-player';
import { api } from '../../services/api';

interface VideoPlayerProps {
  contentId: string;
  videoUrl: string;
  initialSeconds?: number;
}

export const VideoLessonPlayer: React.FC<VideoPlayerProps> = ({
  contentId,
  videoUrl,
  initialSeconds = 0
}) => {
  const playerRef = useRef<ReactPlayer>(null);
  const lastSavedSecond = useRef<number>(initialSeconds);

  const handleReady = () => {
    if (initialSeconds > 0 && playerRef.current) {
      playerRef.current.seekTo(initialSeconds, 'seconds');
    }
  };

  const handleProgress = async (state: { played: number; playedSeconds: number }) => {
    // Salva a cada 10 segundos assistidos
    if (Math.abs(state.playedSeconds - lastSavedSecond.current) >= 10) {
      lastSavedSecond.current = state.playedSeconds;
      await api.post('/progress/sync', {
        contentId,
        lastPosition: String(Math.floor(state.playedSeconds)),
        percentage: Math.round(state.played * 100)
      });
    }
  };

  const handleEnded = async () => {
    await api.post('/progress/sync', {
      contentId,
      lastPosition: '0',
      percentage: 100
    });
  };

  return (
    <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
      <ReactPlayer
        ref={playerRef}
        url={videoUrl}
        width="100%"
        height="100%"
        controls
        onReady={handleReady}
        onProgress={handleProgress}
        onEnded={handleEnded}
      />
    </div>
  );
};