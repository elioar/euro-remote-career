"use client";

interface DecorativeVideoProps {
  src: string;
  className?: string;
  videoClassName?: string;
}

export function DecorativeVideo({ src, className, videoClassName }: DecorativeVideoProps) {
  return (
    <div className={className}>
      <video
        src={src}
        autoPlay
        loop
        muted
        playsInline
        disablePictureInPicture
        controlsList="nodownload nofullscreen noremoteplayback"
        disableRemotePlayback
        onContextMenu={(e) => e.preventDefault()}
        className={videoClassName}
      />
      {/* Transparent overlay to block all mouse interactions and hide browser overlays */}
      <div className="absolute inset-0 z-10 h-full w-full bg-transparent" />
    </div>
  );
}
