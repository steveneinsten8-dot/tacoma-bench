import { Composition } from "remotion";
import { TacomaShort, TACOMA_FRAMES } from "./videos/tacoma/TacomaShort";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TacomaShort"
        component={TacomaShort}
        durationInFrames={TACOMA_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
