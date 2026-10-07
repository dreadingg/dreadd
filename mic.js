document.getElementById('mic').addEventListener('click', async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // use stream here
  } catch (err) {
    console.error('Mic denied or unavailable:', err.name, err.message);
  }
});
