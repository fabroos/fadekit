'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { html as htmlLang, htmlLanguage } from '@codemirror/lang-html';
import { css as cssLang } from '@codemirror/lang-css';
import type { CompletionContext, CompletionResult } from '@codemirror/autocomplete';
import { syntaxHighlighting } from '@codemirror/language';
import { oneDarkHighlightStyle } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';
import { Button } from '@/components/ui/button';
import { Cluster, Filler } from '@/components/ui/cluster';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type Curve, CurveInspector, parseStops } from '@/components/curve-inspector';
import { DEFAULT_CSS, EXAMPLES } from '@/lib/examples';
import {
  type Compiler,
  createCompiler,
  extractCandidates,
  extractUtilities,
  getClassList,
} from '@/lib/tailwind';

type State = { html: string; css: string };

const PREVIEW_DOC = `<!doctype html><html><head><style id="tw"></style><style>[data-inspected]{outline:2px solid oklch(0.452 0.313 264);outline-offset:2px}</style></head><body></body></html>`;

/** Transparent editor so it sits on the panel's own background, in the kit's mono font. */
const editorTheme = [
  EditorView.theme(
    {
      '&': { backgroundColor: 'transparent', color: 'var(--foreground)', fontSize: '13px' },
      '.cm-content, .cm-gutters': { fontFamily: 'var(--font-mono)' },
      '.cm-gutters': {
        backgroundColor: 'transparent',
        color: 'var(--muted-foreground)',
        border: 'none',
      },
      '.cm-activeLine, .cm-activeLineGutter': { backgroundColor: 'var(--accent)' },
      '&.cm-focused': { outline: 'none' },
      '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection': {
        backgroundColor: 'oklch(0.452 0.313 264 / 0.45) !important',
      },
      '.cm-cursor': { borderLeftColor: 'var(--foreground)' },
      '.cm-tooltip': { backgroundColor: 'var(--popover)', border: 'none' },
      '.cm-tooltip-autocomplete > ul > li[aria-selected]': {
        backgroundColor: 'var(--primary)',
        color: 'var(--primary-foreground)',
      },
    },
    { dark: true }
  ),
  syntaxHighlighting(oneDarkHighlightStyle),
];

/** Child-index path from <body>, so a selection survives re-rendering the HTML. */
function pathTo(el: Element, body: HTMLElement): number[] {
  const path: number[] = [];
  for (let node: Element = el; node !== body && node.parentElement; node = node.parentElement) {
    path.unshift(Array.prototype.indexOf.call(node.parentElement.children, node));
  }
  return path;
}

function resolvePath(body: HTMLElement, path: number[]): Element | null {
  let node: Element | null = body;
  for (const i of path) node = node?.children[i] ?? null;
  return node;
}

function encodeState(state: State): string {
  const bytes = new TextEncoder().encode(JSON.stringify(state));
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function decodeState(encoded: string): State | null {
  try {
    const binary = atob(encoded.replace(/-/g, '+').replace(/_/g, '/'));
    const state = JSON.parse(
      new TextDecoder().decode(Uint8Array.from(binary, c => c.charCodeAt(0)))
    );
    return typeof state.html === 'string' && typeof state.css === 'string' ? state : null;
  } catch {
    return null;
  }
}

export function Playground() {
  const [state, setState] = useState<State>({ html: EXAMPLES[0].html, css: DEFAULT_CSS });
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [compileMs, setCompileMs] = useState<number | null>(null);
  const [previewReady, setPreviewReady] = useState(false);
  const [inspectedPath, setInspectedPath] = useState<number[] | null>(null);
  const [curve, setCurve] = useState<Curve | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const classListRef = useRef<string[]>([]);
  const editedRef = useRef(false);
  const compilerRef = useRef<{
    css: string;
    create: typeof createCompiler;
    compiler: Promise<Compiler>;
    built: Set<string>;
  } | null>(null);

  // Restore a shared playground (?code=…) and bring it into view.
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code');
    const restored = code && decodeState(code);
    if (!restored) return;
    setState(restored);
    sectionRef.current?.scrollIntoView();
  }, []);

  // Only edits are worth sharing, so the URL stays clean until the code changes.
  useEffect(() => {
    if (!editedRef.current) return;
    const id = setTimeout(() => {
      const url = new URL(window.location.href);
      url.searchParams.set('code', encodeState(state));
      window.history.replaceState(null, '', url);
    }, 300);
    return () => clearTimeout(id);
  }, [state]);

  const edit = (patch: Partial<State>) => {
    editedRef.current = true;
    setState(s => ({ ...s, ...patch }));
  };

  // Compile on every change. `build()` is incremental, so the compiler is only recreated
  // when the CSS (or the plugin, via HMR) changes, or a class was removed from the HTML.
  useEffect(() => {
    let cancelled = false;
    const start = performance.now();
    const candidates = extractCandidates(state.html);
    let entry = compilerRef.current;
    if (
      !entry ||
      entry.css !== state.css ||
      entry.create !== createCompiler ||
      [...entry.built].some(c => !candidates.includes(c))
    ) {
      entry = {
        css: state.css,
        create: createCompiler,
        compiler: createCompiler(state.css),
        built: new Set(),
      };
      compilerRef.current = entry;
    }
    const current = entry;

    current.compiler
      .then(compiler => {
        const css = compiler.build(candidates);
        candidates.forEach(c => current.built.add(c));
        if (cancelled) return;
        setOutput(css);
        setError(null);
        setCompileMs(performance.now() - start);
      })
      .catch((err: unknown) => {
        if (compilerRef.current === current) compilerRef.current = null;
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      });

    return () => {
      cancelled = true;
    };
    // `createCompiler` gets a new identity when the plugin source hot-reloads.
  }, [state.html, state.css, createCompiler]);

  useEffect(() => {
    let cancelled = false;
    const id = setTimeout(() => {
      getClassList(state.css)
        .then(list => {
          if (!cancelled) classListRef.current = list;
        })
        .catch(() => {});
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [state.css, getClassList]);

  // The srcdoc can finish loading before hydration, so check right away too.
  useEffect(() => {
    const iframe = iframeRef.current!;
    const check = () => setPreviewReady(!!iframe.contentDocument?.getElementById('tw'));
    check();
    iframe.addEventListener('load', check);
    return () => iframe.removeEventListener('load', check);
  }, []);

  useEffect(() => {
    const doc = iframeRef.current?.contentDocument;
    if (!previewReady || !doc) return;
    doc.getElementById('tw')!.textContent = output;
  }, [output, previewReady]);

  useEffect(() => {
    const doc = iframeRef.current?.contentDocument;
    if (!previewReady || !doc) return;
    doc.body.innerHTML = state.html;
  }, [state.html, previewReady]);

  // Click anything in the preview to plot the gradient the browser actually renders.
  useEffect(() => {
    const doc = iframeRef.current?.contentDocument;
    if (!previewReady || !doc) return;
    const onClick = (event: MouseEvent) => {
      event.preventDefault();
      let el = event.target as Element | null;
      while (el && el !== doc.body) {
        if (getComputedStyle(el).backgroundImage.includes('linear-gradient')) break;
        el = el.parentElement;
      }
      setInspectedPath(el && el !== doc.body ? pathTo(el, doc.body) : null);
    };
    doc.addEventListener('click', onClick);
    return () => doc.removeEventListener('click', onClick);
  }, [previewReady]);

  useEffect(() => {
    const doc = iframeRef.current?.contentDocument;
    if (!previewReady || !doc) return;
    doc.querySelectorAll('[data-inspected]').forEach(el => el.removeAttribute('data-inspected'));
    const el = inspectedPath && resolvePath(doc.body, inspectedPath);
    if (!el) {
      setCurve(null);
      return;
    }
    el.setAttribute('data-inspected', '');
    setCurve({
      classes: el.getAttribute('class') ?? '',
      stops: parseStops(getComputedStyle(el).backgroundImage),
    });
  }, [inspectedPath, output, state.html, previewReady]);

  const htmlExtensions = useMemo(
    () => [
      htmlLang(),
      EditorView.lineWrapping,
      htmlLanguage.data.of({
        autocomplete: (context: CompletionContext): CompletionResult | null => {
          const line = context.state.doc.lineAt(context.pos);
          const before = line.text.slice(0, context.pos - line.from);
          if (!/class(?:Name)?=["'][^"']*$/.test(before)) return null;
          const word = context.matchBefore(/[^\s"']*/);
          if (!word || (word.from === word.to && !context.explicit)) return null;
          return {
            from: word.from,
            options: classListRef.current.map(label => ({
              label,
              type: 'class',
              boost: label.startsWith('fade') ? 1 : 0,
            })),
            validFor: /^[^\s"']*$/,
          };
        },
      }),
    ],
    []
  );
  const cssExtensions = useMemo(() => [cssLang(), EditorView.lineWrapping], []);
  const utilities = useMemo(() => extractUtilities(output), [output]);

  const activeExample = EXAMPLES.find(e => e.html === state.html && state.css === DEFAULT_CSS);

  return (
    <Cluster ref={sectionRef} direction="col" align="stretch">
      <Cluster wrap>
        {EXAMPLES.map(example => (
          <Button
            key={example.name}
            size="sm"
            variant={activeExample === example ? 'accent' : 'muted'}
            onClick={() => {
              setState({ html: example.html, css: DEFAULT_CSS });
              setInspectedPath(null);
            }}
            className="font-mono text-xs tracking-wide uppercase"
          >
            {example.name}
          </Button>
        ))}
        <Filler className="h-8" />
        <span className="flex h-8 items-center px-3 font-mono text-xs tracking-wide text-muted-foreground uppercase">
          {error ? 'Error' : compileMs === null ? 'Compiling' : `${compileMs.toFixed(1)}ms`}
        </span>
      </Cluster>

      <div className="grid h-[min(78vh,760px)] min-h-[520px] grid-rows-2 gap-gap bg-transparent md:grid-cols-2 md:grid-rows-1">
        <Tabs defaultValue="html" className="min-h-0 gap-gap">
          <TabsList className="h-9 shrink-0">
            <TabsTrigger value="html">HTML</TabsTrigger>
            <TabsTrigger value="css">CSS</TabsTrigger>
            <TabsTrigger value="output">Generated CSS</TabsTrigger>
          </TabsList>
          <div className="relative flex min-h-0 flex-1 flex-col bg-muted">
            <TabsContent value="html" className="min-h-0 overflow-auto">
              <CodeMirror
                value={state.html}
                onChange={html => edit({ html })}
                extensions={htmlExtensions}
                theme={editorTheme}
                height="100%"
                className="h-full"
              />
            </TabsContent>
            <TabsContent value="css" className="min-h-0 overflow-auto">
              <CodeMirror
                value={state.css}
                onChange={css => edit({ css })}
                extensions={cssExtensions}
                theme={editorTheme}
                height="100%"
                className="h-full"
              />
            </TabsContent>
            <TabsContent value="output" className="min-h-0 overflow-auto">
              <CodeMirror
                value={utilities || '/* No utilities generated */'}
                extensions={cssExtensions}
                theme={editorTheme}
                height="100%"
                className="h-full"
                editable={false}
              />
            </TabsContent>
            {error && (
              <pre className="shrink-0 bg-destructive/20 px-3 py-2 font-mono text-xs whitespace-pre-wrap text-destructive">
                {error}
              </pre>
            )}
          </div>
        </Tabs>

        <div className="relative min-h-0 bg-white">
          <iframe ref={iframeRef} title="Preview" srcDoc={PREVIEW_DOC} className="h-full w-full" />
          <CurveInspector curve={curve} onClose={() => setInspectedPath(null)} />
        </div>
      </div>
    </Cluster>
  );
}
