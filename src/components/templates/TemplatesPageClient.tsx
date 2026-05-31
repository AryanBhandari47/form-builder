"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { selectAllTemplates } from "@/store/selectors/templateSelectors";
import { persistedTemplateIds } from "@/lib/storage";
import { TemplateCard } from "@/components/TemplateCard";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { EmptyState } from "@/shared/ui/EmptyState";
import { SkeletonCard } from "@/shared/ui/SkeletonCard";
import {
  IconGrid,
  IconHeart,
  IconDocument,
  IconDraft,
  IconSearch,
  IconPlus,
  IconFormEmpty,
  IconMenu,
  IconX,
} from "@/shared/ui/Icons";
import { NavLink } from "./NavLink";
import { ScratchCard } from "./ScratchCard";

export default function TemplatesPageClient() {
  const router = useRouter();
  const templates = useSelector(selectAllTemplates);
  const storageReady = useSelector((state: RootState) => state.app.storageReady);

  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on resize to desktop
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768) setSidebarOpen(false);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const filtered = useMemo(() => {
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

  function closeSidebar() {
    setSidebarOpen(false);
  }

  const sidebarContent = (
    <>
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
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside
        aria-label="Sidebar"
        className="hidden md:flex w-[220px] shrink-0 flex-col bg-sidebar border-r border-border overflow-y-auto"
      >
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeSidebar}
          />
          <aside className="absolute inset-y-0 left-0 w-[260px] bg-sidebar border-r border-border overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 px-4 py-5 border-b border-border flex-1">
                <div className="flex items-center justify-center w-7 h-7 rounded-sm bg-primary text-white text-xs font-bold">
                  F
                </div>
                <span className="text-sm font-semibold text-text-primary tracking-tight">
                  FormCraft
                </span>
              </div>
              <button
                type="button"
                onClick={closeSidebar}
                className="p-2 mr-2 text-text-muted hover:text-text-primary rounded-sm"
                aria-label="Close menu"
              >
                <IconX />
              </button>
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
        </div>
      )}

      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 sm:px-6 py-4 sm:py-5 border-b border-border bg-surface shrink-0">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-1.5 -ml-1 text-text-secondary hover:text-text-primary rounded-sm"
            aria-label="Open menu"
          >
            <IconMenu />
          </button>

          <div className="flex-1 min-w-0">
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
            size="sm"
            leftIcon={<IconPlus />}
            onClick={handleNewForm}
          >
            <span className="hidden sm:inline">New Form</span>
            <span className="sm:hidden">New</span>
          </Button>
        </header>

        {/* Search */}
        <div className="flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 border-b border-border-subtle shrink-0">
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
          {!storageReady ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <ScratchCard onClick={handleNewForm} />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
