import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackMetaPageView } from "../utils/metaPixel";

function MetaPixelRouteTracker() {
  const location = useLocation();

  useEffect(() => {
    trackMetaPageView(`${location.pathname}${location.search}`);
  }, [location.pathname, location.search]);

  return null;
}

export default MetaPixelRouteTracker;
