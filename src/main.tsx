import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { useGameStore } from "./store/gameStore";

const root = createRoot(document.getElementById("root")!);

// Initialize the store data
useGameStore.getState().initialize().then(() => {
  root.render(<App />);
});
