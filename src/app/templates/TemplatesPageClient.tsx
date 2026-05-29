"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { selectAllTemplates } from "@/store/selectors/templateSelectors";
import { persistedTemplateIds } from "@/modules/storage/localStorage.adapter";
import { TemplateCard } from "@/modules/form-builder/components/TemplateCard";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { EmptyState } from "@/shared/ui/EmptyState";
import { SkeletonCard } from "@/shared/ui/SkeletonCard";

interface NavLinkProps {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}

function NavLink({ href, active, children }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={`
        flex items-center gap-2.5 px-3 py-2 text-sm rounded-sm
        transition-colors duration-100 font-medium
        ${
          active
            ? "bg-primary-light text-primary"
            : "text-text-secondary hover:bg-border hover:text-text-primary"
        }
      `}
    >
      {children}
    </Link>
  );
}

function IconGrid() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconHeart() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 13.5S1.5 9.5 1.5 5.5C1.5 3.567 3.067 2 5 2c1.122 0 2.12.552 2.75 1.4L8 3.6l.25-.2C8.88 2.552 9.878 2 11 2c1.933 0 3.5 1.567 3.5 3.5 0 4-6.5 8-6.5 8z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconDocument() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M9 1H4a1 1 0 00-1 1v12a1 1 0 001 1h8a1 1 0 001-1V6L9 1z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9 1v5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconDraft() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M11.5 2.5l2 2-7 7H4.5v-2l7-7z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M1.5 13.5h13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconFormEmpty() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="6" y="4" width="20" height="24" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 11h12M10 16h12M10 21h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ScratchCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group flex flex-col items-center justify-center gap-3
        border-2 border-dashed border-border rounded-[var(--radius-lg)]
        p-8 text-center
        hover:border-primary hover:bg-primary-light
        transition-colors duration-150 cursor-pointer
        min-h-[180px]
      "
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-sidebar group-hover:bg-primary-light text-text-muted group-hover:text-primary transition-colors">
        <IconPlus />
      </div>
      <div>
        <p className="text-sm font-semibold text-text-primary group-hover:text-primary">
          Start from scratch
        </p>
        <p className="text-xs text-text-muted mt-0.5">Build a blank form</p>
      </div>
    </button>
  );
}

export default function TemplatesPageClient() {
  const router = useRouter();
  const templates = useSelector(selectAllTemplates);

  const [search, setSearch] = React.useState("");
  const [isHydrated, setIsHydrated] = React.useState(false);

  React.useEffect(() => {
    setIsHydrated(true);
  }, []);

  const filtered = React.useMemo(() => {
    const persisted = templates.filter((t) => persistedTemplateIds.has(t.id));
    if (!search.trim()) return persisted;
    const q = search.toLowerCase();
    return persisted.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q)
    );
  }, [templates, search]);

  function handleNewForm() {
    router.push("/templates/new");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside
        aria-label="Sidebar"
        className="w-[220px] flex-shrink-0 flex flex-col bg-sidebar border-r border-border overflow-y-auto"
      >
        <div className="flex items-center gap-2.5 px-4 py-5 border-b border-border">
          <div className="flex items-center justify-center w-7 h-7 rounded-sm bg-primary text-white text-xs font-bold">
            F
          </div>
          <span className="text-sm font-semibold text-text-primary tracking-tight">
            FormCraft
          </span>
        </div>

        <nav className="flex flex-col gap-1 p-3 flex-1">
          <p className="px-3 py-1.5 text-[11px] font-semibold text-text-muted uppercase tracking-wider">
            Library
          </p>

          <NavLink href="/templates" active>
            <IconGrid />
            All Templates
          </NavLink>

          <NavLink href="/templates/favorites">
            <IconHeart />
            Favorites
          </NavLink>

          <div className="border-t border-border-subtle my-2" />

          <p className="px-3 py-1.5 text-[11px] font-semibold text-text-muted uppercase tracking-wider">
            Personal
          </p>

          <NavLink href="/templates/my-forms">
            <IconDocument />
            My Forms
          </NavLink>

          <NavLink href="/templates/drafts">
            <IconDraft />
            Drafts
          </NavLink>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-6 py-5 border-b border-border bg-surface flex-shrink-0">
          <div>
            <h1 className="text-lg font-semibold text-text-primary">
              Templates
            </h1>
            <p className="text-sm text-text-muted mt-0.5">
              {filtered.length}{" "}
              {filtered.length === 1 ? "template" : "templates"} available
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            leftIcon={<IconPlus />}
            onClick={handleNewForm}
          >
            New Form
          </Button>
        </header>

        <div className="flex items-center gap-3 px-6 py-4 border-b border-border-subtle flex-shrink-0">
          <div className="flex-1 max-w-sm">
            <Input
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              prefix={<IconSearch />}
              aria-label="Search templates"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {!isHydrated ? (
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filtered.length === 0 && search.trim() ? (
            <EmptyState
              icon={<IconFormEmpty />}
              title="No templates found"
              description={`No templates match "${search}". Try a different search term.`}
              action={
                <Button variant="ghost" size="sm" onClick={() => setSearch("")}>
                  Clear search
                </Button>
              }
            />
          ) : filtered.length === 0 ? (
            <div className="grid grid-cols-3 gap-4">
              <ScratchCard onClick={handleNewForm} />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {filtered.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
              <ScratchCard onClick={handleNewForm} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
