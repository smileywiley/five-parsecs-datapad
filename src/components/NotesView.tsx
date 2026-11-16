import { useState } from 'react';
import {
  BookOpen,
  Eye,
  FilePlus2,
  Link2,
  Pencil,
  Pin,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { useCampaign } from '../state/CampaignContext';
import { CampaignNote, NoteCategory } from '../types/campaign';
import { NOTE_TEMPLATES, NoteTemplate } from '../data/noteTemplates';
import { createId } from '../data/sampleCampaign';
import { MarkdownText } from './MarkdownText';

const CATEGORIES: NoteCategory[] = ['Threads', 'Locations', 'NPCs', 'Lore', 'Session Notes'];

export function NotesView() {
  const { activeCampaign, dispatch } = useCampaign();
  const [filterCat, setFilterCat] = useState<NoteCategory | 'All' | 'Pinned'>('All');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(
    activeCampaign?.notes[0]?.id ?? null
  );
  const [mode, setMode] = useState<'split' | 'edit' | 'preview'>('split');

  if (!activeCampaign) return null;

  const filtered = activeCampaign.notes.filter((n) => {
    if (filterCat === 'Pinned' && !n.pinned) return false;
    if (filterCat !== 'All' && filterCat !== 'Pinned' && n.category !== filterCat) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.tags.some((t) => t.toLowerCase().includes(q)) ||
        (n.links.planet ?? '').toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const activeNote =
    activeCampaign.notes.find((n) => n.id === selectedId) ?? filtered[0] ?? null;

  const createNote = (template?: NoteTemplate) => {
    const note: CampaignNote = {
      id: createId('note'),
      title: template ? `${template.defaultTitle}Untitled` : 'New Journal Entry',
      category: template ? template.category : 'Session Notes',
      content: template ? template.content : '',
      pinned: false,
      tags: [],
      links: {
        turn: activeCampaign.turn,
        planet: activeCampaign.currentPlanet || undefined,
      },
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'UPSERT_NOTE', note });
    setSelectedId(note.id);
    setMode('split');
  };

  const updateNote = (patch: Partial<CampaignNote>) => {
    if (!activeNote) return;
    dispatch({
      type: 'UPSERT_NOTE',
      note: { ...activeNote, ...patch, updatedAt: new Date().toISOString() },
    });
  };

  const insertTemplateIntoCurrent = (tpl: NoteTemplate) => {
    if (!activeNote) {
      createNote(tpl);
      return;
    }
    const separator = activeNote.content.trim() ? '\n\n---\n\n' : '';
    updateNote({ content: activeNote.content + separator + tpl.content });
  };

  return (
    <div className="space-y-4">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {(['All', 'Pinned', ...CATEGORIES] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                filterCat === cat
                  ? 'bg-cyan-600 text-white'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes & tags..."
              className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
            />
          </div>
          <button
            onClick={() => createNote()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Blank Note
          </button>
        </div>
      </div>

      {/* Quick-Insert Solo GM Templates */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5">
        <span className="text-[11px] font-mono uppercase tracking-wider text-violet-600 dark:text-violet-400 flex items-center gap-1.5 mr-1">
          <FilePlus2 className="w-3.5 h-3.5" /> Solo GM Templates:
        </span>
        {NOTE_TEMPLATES.map((tpl) => (
          <button
            key={tpl.id}
            onClick={() => createNote(tpl)}
            className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-cyan-500/15 hover:text-cyan-600 dark:hover:text-cyan-300 border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            + {tpl.label}
          </button>
        ))}
      </div>

      {/* Main Split View: Note List + Editor/Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[540px]">
        {/* Left List */}
        <div className="lg:col-span-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 space-y-1.5 overflow-y-auto max-h-[640px]">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              <BookOpen className="w-5 h-5 mx-auto mb-2 opacity-50" />
              No notes yet. Use a Solo GM template above to start!
            </div>
          ) : (
            filtered.map((note) => {
              const selected = activeNote?.id === note.id;
              return (
                <button
                  key={note.id}
                  onClick={() => setSelectedId(note.id)}
                  className={`w-full text-left rounded-lg p-2.5 border transition-colors cursor-pointer ${
                    selected
                      ? 'bg-cyan-500/10 border-cyan-500/40'
                      : 'bg-slate-50/70 dark:bg-slate-950/50 border-slate-200/70 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-mono uppercase text-cyan-600 dark:text-cyan-400">
                      {note.category}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {note.links.turn !== undefined && (
                        <span className="text-[10px] font-mono text-slate-500">
                          T{note.links.turn}
                        </span>
                      )}
                      {note.pinned && <Pin className="w-3 h-3 text-amber-500" />}
                    </div>
                  </div>
                  <div className="text-sm font-semibold truncate mt-0.5">{note.title}</div>
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {note.tags.slice(0, 3).map((t, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Right Editor / Preview */}
        <div className="lg:col-span-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col space-y-3">
          {!activeNote ? (
            <div className="flex-1 flex items-center justify-center text-sm text-slate-500">
              Select or create a journal note to begin writing.
            </div>
          ) : (
            <>
              {/* Title & Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={activeNote.title}
                  onChange={(e) => updateNote({ title: e.target.value })}
                  className="flex-1 min-w-[200px] text-base font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                <select
                  value={activeNote.category}
                  onChange={(e) => updateNote({ category: e.target.value as NoteCategory })}
                  className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 text-xs"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => dispatch({ type: 'TOGGLE_PIN_NOTE', id: activeNote.id })}
                  title="Pin to Dashboard"
                  className={`p-2 rounded-lg border cursor-pointer ${
                    activeNote.pinned
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-500'
                      : 'border-slate-300 dark:border-slate-700 text-slate-400 hover:text-amber-500'
                  }`}
                >
                  <Pin className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete note "${activeNote.title}"?`)) {
                      dispatch({ type: 'DELETE_NOTE', id: activeNote.id });
                      setSelectedId(null);
                    }
                  }}
                  title="Delete Note"
                  className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-400 hover:text-rose-500 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Cross-Links & Tags */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-500 mb-0.5">
                    Turn #
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={activeNote.links.turn ?? ''}
                    onChange={(e) =>
                      updateNote({
                        links: {
                          ...activeNote.links,
                          turn: e.target.value ? Number(e.target.value) : undefined,
                        },
                      })
                    }
                    placeholder="-"
                    className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-500 mb-0.5">
                    Planet
                  </label>
                  <input
                    type="text"
                    value={activeNote.links.planet ?? ''}
                    onChange={(e) =>
                      updateNote({
                        links: { ...activeNote.links, planet: e.target.value || undefined },
                      })
                    }
                    placeholder="Any"
                    className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-500 mb-0.5">
                    Linked Patron
                  </label>
                  <select
                    value={activeNote.links.patronId ?? ''}
                    onChange={(e) =>
                      updateNote({
                        links: { ...activeNote.links, patronId: e.target.value || undefined },
                      })
                    }
                    className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-1.5 py-1"
                  >
                    <option value="">None</option>
                    {activeCampaign.patrons.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-500 mb-0.5">
                    Linked Rival
                  </label>
                  <select
                    value={activeNote.links.rivalId ?? ''}
                    onChange={(e) =>
                      updateNote({
                        links: { ...activeNote.links, rivalId: e.target.value || undefined },
                      })
                    }
                    className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-1.5 py-1"
                  >
                    <option value="">None</option>
                    {activeCampaign.rivals.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-500 mb-0.5 flex items-center gap-1">
                    <Link2 className="w-3 h-3" /> Tags
                  </label>
                  <input
                    type="text"
                    value={activeNote.tags.join(', ')}
                    onChange={(e) =>
                      updateNote({
                        tags: e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="mystery, clue"
                    className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1"
                  />
                </div>
              </div>

              {/* View Mode + Append Template */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-100 dark:bg-slate-950 text-xs">
                  <button
                    onClick={() => setMode('split')}
                    className={`px-2.5 py-1 rounded-md cursor-pointer ${
                      mode === 'split' ? 'bg-white dark:bg-slate-800 font-semibold shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    Split
                  </button>
                  <button
                    onClick={() => setMode('edit')}
                    className={`px-2.5 py-1 rounded-md inline-flex items-center gap-1 cursor-pointer ${
                      mode === 'edit' ? 'bg-white dark:bg-slate-800 font-semibold shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                  <button
                    onClick={() => setMode('preview')}
                    className={`px-2.5 py-1 rounded-md inline-flex items-center gap-1 cursor-pointer ${
                      mode === 'preview' ? 'bg-white dark:bg-slate-800 font-semibold shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    <Eye className="w-3 h-3" /> Preview
                  </button>
                </div>

                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="text-slate-500">Insert into note:</span>
                  {NOTE_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => insertTemplateIntoCurrent(tpl)}
                      className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 hover:border-cyan-500/50 text-slate-600 dark:text-slate-300 cursor-pointer"
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Editor / Preview Area */}
              <div
                className={`flex-1 grid gap-3 min-h-[340px] ${
                  mode === 'split' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
                }`}
              >
                {mode !== 'preview' && (
                  <textarea
                    value={activeNote.content}
                    onChange={(e) => updateNote({ content: e.target.value })}
                    placeholder="Write your Solo GM scene, thread, or lore in Markdown..."
                    className="w-full h-full min-h-[320px] rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3 text-xs font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-none"
                  />
                )}
                {mode !== 'edit' && (
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-3 overflow-y-auto max-h-[420px]">
                    {activeNote.content.trim() ? (
                      <MarkdownText content={activeNote.content} />
                    ) : (
                      <p className="text-xs text-slate-400 italic">Nothing to preview yet.</p>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
