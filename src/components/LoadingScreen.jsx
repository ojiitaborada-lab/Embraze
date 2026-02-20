import { Player } from '@lottiefiles/react-lottie-player';
import loadingAnimation from '../../public/Loading.json';

function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <div className="w-20 h-20">
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
