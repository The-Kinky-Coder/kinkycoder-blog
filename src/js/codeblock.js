function initCodeblocks() {
  const blocks = document.querySelectorAll('.codeblock');

  blocks.forEach((block) => {
    if (block.dataset.initialized) {
      return;
    }
    block.dataset.initialized = 'true';

    const copyButton = block.querySelector('.codeblock-copy');
    const codeElement = block.querySelector('code');

    if (!copyButton || !codeElement) {
      return;
    }

    const setCopyState = (state, label) => {
      block.dataset.copyState = state;
      copyButton.textContent = label;
      window.clearTimeout(copyButton._resetTimeout);
      copyButton._resetTimeout = window.setTimeout(() => {
        copyButton.textContent = 'Copy';
        delete block.dataset.copyState;
      }, 1800);
    };

    copyButton.addEventListener('click', async () => {
      const codeText = codeElement.textContent || '';

      try {
        await navigator.clipboard.writeText(codeText.trimEnd());
        setCopyState('copied', 'Copied');
      } catch (error) {
        const textarea = document.createElement('textarea');
        textarea.value = codeText;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand('copy');
          setCopyState('copied', 'Copied');
        } catch (execError) {
          setCopyState('failed', 'Failed');
        }
        document.body.removeChild(textarea);
      }
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCodeblocks);
} else {
  initCodeblocks();
}
