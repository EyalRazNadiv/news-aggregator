export function useDarkMode() {
  const isDark = useState("dark-mode", () => false);

  function applyClass(dark: boolean) {
    if (import.meta.client) {
      document.documentElement.classList.toggle("dark", dark);
    }
  }

  function toggleDark() {
    isDark.value = !isDark.value;
    applyClass(isDark.value);
    if (import.meta.client) {
      localStorage.setItem("dark-mode", isDark.value ? "dark" : "light");
    }
  }

  // Defer to onMounted to avoid hydration mismatch
  if (import.meta.client) {
    onMounted(() => {
      const stored = localStorage.getItem("dark-mode");
      if (stored) {
        isDark.value = stored === "dark";
      } else {
        isDark.value = window.matchMedia("(prefers-color-scheme: dark)").matches;
      }
      applyClass(isDark.value);
    });
  }

  // Inject inline script to prevent flash of wrong theme (runs before Vue hydrates)
  useHead({
    script: [
      {
        innerHTML: `(function(){try{var d=localStorage.getItem('dark-mode');var dark=d?d==='dark':window.matchMedia('(prefers-color-scheme:dark)').matches;if(dark)document.documentElement.classList.add('dark')}catch(e){}})()`,
        tagPosition: "head",
      },
    ],
  });

  return { isDark, toggleDark };
}
