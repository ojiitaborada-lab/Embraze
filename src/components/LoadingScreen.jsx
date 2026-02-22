import { Player } from '@lottiefiles/react-lottie-player';
import loadingAnimation from '../assets/Trail loading.json';

function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <div className="w-40 h-40 md:w-48 md:h-48">
        <Player
          autoplay
          loop
          src={loadingAnimation}
          style={{ height: '100%', width: '100%' }}
        />
      </div>
    </div>
  );
}

export default LoadingScreen;
