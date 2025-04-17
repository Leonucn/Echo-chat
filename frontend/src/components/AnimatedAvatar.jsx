import Lottie from "lottie-react";
import loginAnimation from "../animations/loginAvatar.json";
import signupAnimation from "../animations/signupAvatar.json";
import noChatAnimation from "../animations/noChatAvatar.json";

const AnimatedAvatar = ({ type = "login" }) => {
  let animationData;

  switch (type) {
    case "login":
      animationData = loginAnimation;
      break;
    case "signup":
      animationData = signupAnimation;
      break;
    case "noChat":
      animationData = noChatAnimation;
      break;
    default:
      animationData = loginAnimation;
  }

  return (
    <div className={type === "signup" ? "size-40" : "size-60"}>
      <Lottie
        animationData={animationData}
        loop={true}
        className="w-full h-full"
      />
    </div>
  );
};

export default AnimatedAvatar;
