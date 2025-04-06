import githubIconUrl from '@/assets/svgs/Github-light.svg';
import blueskyIconUrl from '@/assets/svgs/Bluesky.svg';

export function SocialLinks() {
  return (
    <div className="flex gap-4 brightness-0">
      <a href="" target="_blank" rel="noopener noreferrer">
        <img src={blueskyIconUrl} alt="bluesky-logo" className="w-6 h-6" />
      </a>
      <a
        href="https://github.com/404mat/open-planning"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img src={githubIconUrl} alt="github-logo" className="w-6 h-6" />
      </a>
    </div>
  );
}
