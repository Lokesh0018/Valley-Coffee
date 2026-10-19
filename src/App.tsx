import Loader from "@/components/engine/Loader";
import SmoothScroll from "@/components/engine/SmoothScroll";
import Animations from "@/components/engine/Animations";
import RecordMode from "@/components/engine/RecordMode";
import SitePage from "@/site/Page";
import { meta } from "@/site/site";

export default function App() {
  return (
    <>
      <Loader text={meta.loaderText ?? meta.name} enabled={meta.loader ?? true} />
      <SmoothScroll />
      <Animations />
      <RecordMode speed={meta.record?.speed} duration={meta.record?.duration} delay={meta.record?.delay} />
      <SitePage />
    </>
  );
}
