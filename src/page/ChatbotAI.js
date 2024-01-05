import React, { useEffect} from "react";

function KommunicateChat() {
    useEffect(() => {
        (function (d, m) {
            var kommunicateSettings = {
            appId: "2953cd6e9d44c9ff7aa642b5556c98f2c",
            popupWidget: true,
            automaticChatOpenOnNavigation: true,
        };
        var s = document.createElement("script"); s.type = "text/javascript"; s.async = true;
        s.src = "https://widget.kommunicate.io/v2/kommunicate.app";
        var h = document.getElementsByTagName("head")[0]; h.appendChild(s);
        window.kommunicate = m; m._globals = kommunicateSettings;
      })(document, window.kommunicate || {});
}, []);
return <div></div>;
}
export default KommunicateChat;