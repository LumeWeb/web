import type { CrudFilters, LogicalFilter } from "@refinedev/core";

import {
  applyFilterAtom,
  clearSelectedFilterAtom,
  deleteFilterAtom,
  getResourceFiltersAtom,
  resourceFiltersAtom,
  type SavedFilter,
  saveFilterAtom,
  selectedFilterAtom,
  updateFilterAtom,
} from "@/store/saved-filters";
import { cn } from "@lumeweb/portal-framework-ui-core";
import { Button } from "@lumeweb/portal-framework-ui-core";
import { Checkbox } from "@lumeweb/portal-framework-ui-core";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@lumeweb/portal-framework-ui-core";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@lumeweb/portal-framework-ui-core";
import { Input } from "@lumeweb/portal-framework-ui-core";
import { Label } from "@lumeweb/portal-framework-ui-core";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@lumeweb/portal-framework-ui-core";
import { useNotification } from "@refinedev/core";
import { useAtom } from "jotai";
import {
  Bookmark,
  BookmarkPlus,
  Check,
  Filter,
  MoreHorizontal,
  Pencil,
  Save,
  Star,
  Trash2,
  X,
} from "lucide-react";
import React from "react";
import { useEffect, useState } from "react";

import { useScreenReaderAnnouncement } from "../screen-reader/hooks/useScreenReaderAnnouncement";

// Update the SavedFiltersPanelProps interface to properly type simpleFilters
interface SavedFiltersPanelProps {
  activeFilters?: LogicalFilter[];
  className?: string;
  clearAllFilters?: () => void;
  currentFilters: LogicalFilter[];
  enableSavedFilters?: boolean;
  fieldsByType?: any;
  onApplyFilter: (filters: CrudFilters) => void;
  onApplyFilters?: (filters: CrudFilters) => void;
  onClearFilters: () => void;
  resource: string;
  searchTerm?: string;
  simpleDateRange?: {
    endDate?: Date;
    field: string;
    startDate?: Date;
  };
  simpleFilters?: Record<string, string[]>;
}

export function SavedFiltersPanel({
  activeFilters,
  className,
  clearAllFilters,
  currentFilters,
  enableSavedFilters = true,
  fieldsByType,
  onApplyFilter,
  onApplyFilters,
  onClearFilters,
  resource,
  searchTerm,
  simpleDateRange,
  simpleFilters,
}: SavedFiltersPanelProps) {
  // Local state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newFilterName, setNewFilterName] = useState("");
  const [makeDefault, setMakeDefault] = useState(false);
  const [editingFilter, setEditingFilter] = useState<null | SavedFilter>(null);
  const [editedName, setEditedName] = useState("");
  const [editedDefault, setEditedDefault] = useState(false);

  // Jotai state - properly use the atoms
  const [savedFilters] = useAtom(resourceFiltersAtom);
  const [selectedFilter] = useAtom(selectedFilterAtom);
  const [, getResourceFilters] = useAtom(getResourceFiltersAtom);
  const [, saveFilter] = useAtom(saveFilterAtom);
  const [, updateFilter] = useAtom(updateFilterAtom);
  const [, deleteFilter] = useAtom(deleteFilterAtom);
  const [, applyFilter] = useAtom(applyFilterAtom);
  const [, clearSelectedFilter] = useAtom(clearSelectedFilterAtom);

  // Get notification hook
  const { open } = useNotification();

  // Add the screen reader announcement hook
  const { announce } = useScreenReaderAnnouncement();

  // Load saved filters for this resource
  useEffect(() => {
    getResourceFilters(resource);
  }, [resource, getResourceFilters]);

  // Fix the handleSaveFilter function to properly handle simpleFilters
  const handleSaveFilter = async () => {
    if (!newFilterName.trim()) {
      open?.({
        description: "Filter name cannot be empty",
        message: "Error",
        type: "error",
      });
      return;
    }

    try {
      // Combine all current filters
      const allCurrentFilters = [
        ...Object.entries(simpleFilters || {}).flatMap(([field, values]) =>
          (values).map((value) => ({
            field,
            operator: "eq" as const,
            value,
          })),
        ),
        ...(searchTerm && fieldsByType?.searchable?.length > 0
          ? [
              {
                field: fieldsByType.searchable[0].field,
                operator: "contains" as const,
                value: searchTerm,
              },
            ]
          : []),
        ...(simpleDateRange?.field && simpleDateRange?.startDate
          ? [
              {
                field: simpleDateRange.field,
                operator: "gte" as const,
                value: simpleDateRange.startDate.toISOString().split("T")[0],
              },
            ]
          : []),
        ...(simpleDateRange?.field && simpleDateRange?.endDate
          ? [
              {
                field: simpleDateRange.field,
                operator: "lte" as const,
                value: simpleDateRange.endDate.toISOString().split("T")[0],
              },
            ]
          : []),
        ...currentFilters,
      ];

      // Use saveFilter atom to save the filter without assigning the return value
      await saveFilter({
        filters: allCurrentFilters as CrudFilters,
        isDefault: makeDefault,
        name: newFilterName.trim(),
        resource,
      });

      // Success message
      open?.({
        description: `Filter "${newFilterName}" has been saved`,
        message: "Success",
        type: "success",
      });

      // Announce filter saving to screen readers
      announce(`Filter "${newFilterName}" has been saved`, "polite");

      // Reset form
      setNewFilterName("");
      setMakeDefault(false);
      setIsCreateModalOpen(false);
    } catch {
      open?.({
        description: "Failed to save filter",
        message: "Error",
        type: "error",
      });
    }
  };

  // Handle updating an existing filter
  const handleUpdateFilter = async () => {
    if (!editingFilter) return;
    if (!editedName.trim()) {
      open?.({
        description: "Filter name cannot be empty",
        message: "Error",
        type: "error",
      });
      return;
    }

    try {
      await updateFilter({
        filterId: editingFilter.id,
        resource,
        updates: {
          isDefault: editedDefault,
          name: editedName.trim(),
        },
      });

      open?.({
        description: `Filter "${editedName}" has been updated`,
        message: "Success",
        type: "success",
      });

      // Reset form
      setEditingFilter(null);
      setEditedName("");
      setEditedDefault(false);
      setIsEditModalOpen(false);
    } catch {
      open?.({
        description: "Failed to update filter",
        message: "Error",
        type: "error",
      });
    }
  };

  // Handle deleting a filter
  const handleDeleteFilter = async (filter: SavedFilter) => {
    try {
      await deleteFilter({
        filterId: filter.id,
        resource,
      });

      open?.({
        description: `Filter "${filter.name}" has been deleted`,
        message: "Success",
        type: "success",
      });

      // Announce filter deletion to screen readers
      announce(`Filter "${filter.name}" has been deleted`, "polite");
    } catch {
      open?.({
        description: "Failed to delete filter",
        message: "Error",
        type: "error",
      });
    }
  };

  // Handle applying a filter
  const handleApplyFilter = (filter: SavedFilter) => {
    const filters = applyFilter(filter.id);
    if (filters) {
      onApplyFilter(filters);
      // Announce filter application to screen readers
      announce(`Applied saved filter: ${filter.name}`, "polite");
    }
  };

  // Add a function to combine current filters with saved filters
  const combineWithCurrentFilters = (savedFilter: SavedFilter) => {
    // Combine the saved filter with current active filters
    if (onApplyFilters && activeFilters) {
      const combinedFilters = [...savedFilter.filters, ...activeFilters];
      onApplyFilters(combinedFilters);
      announce(
        `Applied saved filter: ${savedFilter.name} combined with current filters`,
        "polite",
      );
    } else {
      // Fall back to regular apply if onApplyFilters is not available
      handleApplyFilter(savedFilter);
    }
  };

  // Add a function to handle clearing all filters
  const handleClearAllFilters = () => {
    if (clearAllFilters) {
      clearAllFilters();
    } else {
      // Fall back to regular clear if clearAllFilters is not available
      handleClearFilter();
    }
    announce("All filters cleared", "polite");
  };

  // Handle clearing the selected filter
  const handleClearFilter = () => {
    clearSelectedFilter();
    onClearFilters();
    // Announce filter clearing to screen readers
    announce("Cleared saved filter", "polite");
  };

  // Open edit modal for a filter
  const openEditModal = (filter: SavedFilter, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFilter(filter);
    setEditedName(filter.name);
    setEditedDefault(!!filter.isDefault);
    setIsEditModalOpen(true);
  };

  // Update the current filter with the latest filters
  const handleUpdateCurrentFilter = async () => {
    if (!selectedFilter) return;

    try {
      await updateFilter({
        filterId: selectedFilter.id,
        resource,
        updates: {
          filters: currentFilters as CrudFilters,
        },
      });

      open?.({
        description: `Filter "${selectedFilter.name}" has been updated with current settings`,
        message: "Success",
        type: "success",
      });
    } catch {
      open?.({
        description: "Failed to update filter",
        message: "Error",
        type: "error",
      });
    }
  };

  // Check if there are any saved filters
  const hasSavedFilters = savedFilters.length > 0;

  return (
    <>
      {/* Saved Filters Panel - conditionally rendered */}
      {enableSavedFilters && (
        <div className={cn("flex flex-wrap items-center gap-2", className)}>
          {/* Selected filter indicator */}
          {selectedFilter && (
            <div className="flex items-center gap-2 bg-primary/10 text-primary rounded-md px-3 py-1.5 text-sm">
              <Bookmark className="h-4 w-4" />
              <span>{selectedFilter.name}</span>
              <Button
                className="h-5 w-5 rounded-full p-0 text-primary hover:bg-primary/20"
                onClick={handleClearFilter}
                size="icon"
                variant="ghost">
                <X className="h-3 w-3" />
                <span className="sr-only">Clear filter</span>
              </Button>
            </div>
          )}

          {/* Add this after the selected filter indicator in the render function */}
          {!selectedFilter &&
            (searchTerm ||
              (simpleFilters && Object.keys(simpleFilters).length > 0) ||
              (simpleDateRange?.field &&
                (simpleDateRange?.startDate || simpleDateRange?.endDate))) && (
              <div className="flex items-center gap-2 bg-muted/30 rounded-md px-3 py-1.5 text-sm">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Current filters active
                </span>
                <Button
                  className="h-5 w-5 rounded-full p-0 text-muted-foreground hover:bg-muted"
                  onClick={handleClearAllFilters}
                  size="icon"
                  variant="ghost">
                  <X className="h-3 w-3" />
                  <span className="sr-only">Clear all filters</span>
                </Button>
              </div>
            )}

          {/* Save current filter button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="h-9"
                  onClick={() => {
                    // Pre-populate the filter name based on active filters
                    let suggestedName = "";
                    if (searchTerm) {
                      suggestedName = `Search: ${searchTerm}`;
                    } else if (
                      simpleFilters &&
                      Object.keys(simpleFilters).length > 0
                    ) {
                      const firstFilter = Object.entries(simpleFilters)[0];
                      const fieldName = firstFilter[0];
                      const values = firstFilter[1];
                      suggestedName = `${fieldName}: ${values.join(", ")}`;
                    }
                    setNewFilterName(suggestedName);
                    setIsCreateModalOpen(true);
                  }}
                  size="sm"
                  variant="outline">
                  <BookmarkPlus className="h-4 w-4 mr-2" />
                  Save Filter
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Save current filter settings for future use</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Update current filter button (only shown when a filter is selected) */}
          {selectedFilter && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="h-9"
                    onClick={handleUpdateCurrentFilter}
                    size="sm"
                    variant="outline">
                    <Save className="h-4 w-4 mr-2" />
                    Update
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Update the selected filter with current settings</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Saved filters dropdown */}
          {hasSavedFilters && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="h-9" size="sm" variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Saved Filters
                  <ChevronDownIcon className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {savedFilters.map((filter) => (
                  <DropdownMenuItem
                    className="flex items-center justify-between py-2 px-3 cursor-pointer"
                    key={filter.id}
                    onSelect={(e) => {
                      e.preventDefault();
                      handleApplyFilter(filter);
                    }}>
                    <div className="flex items-center gap-2">
                      {filter.isDefault && (
                        <Star className="h-3.5 w-3.5 text-amber-500" />
                      )}
                      <span className={filter.isDefault ? "font-medium" : ""}>
                        {filter.name}
                      </span>
                    </div>
                    <div className="flex items-center">
                      {selectedFilter?.id === filter.id && (
                        <Check className="h-4 w-4 text-primary mr-2" />
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          asChild
                          onClick={(e) => e.stopPropagation()}>
                          <Button
                            className="h-7 w-7"
                            size="icon"
                            variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            onClick={(e) => openEditModal(filter, e)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          {/* Add a new option to combine with current filters */}
                          {(searchTerm ||
                            (simpleFilters &&
                              Object.keys(simpleFilters).length > 0) ||
                            (simpleDateRange?.field &&
                              (simpleDateRange?.startDate ||
                                simpleDateRange?.endDate))) && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                combineWithCurrentFilters(filter);
                              }}>
                              <Filter className="h-4 w-4 mr-2" />
                              Combine with Current
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFilter(filter);
                            }}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Create filter modal */}
          <Dialog onOpenChange={setIsCreateModalOpen} open={isCreateModalOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Save Filter</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="filter-name">Filter Name</Label>
                  <Input
                    id="filter-name"
                    onChange={(e) => setNewFilterName(e.target.value)}
                    placeholder="Enter a name for this filter"
                    value={newFilterName}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={makeDefault}
                    id="make-default"
                    onCheckedChange={(checked) =>
                      setMakeDefault(checked as boolean)
                    }
                  />
                  <Label className="cursor-pointer" htmlFor="make-default">
                    Set as default filter
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleSaveFilter}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit filter modal */}
          <Dialog onOpenChange={setIsEditModalOpen} open={isEditModalOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit Filter</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-filter-name">Filter Name</Label>
                  <Input
                    id="edit-filter-name"
                    onChange={(e) => setEditedName(e.target.value)}
                    placeholder="Enter a name for this filter"
                    value={editedName}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={editedDefault}
                    id="edit-make-default"
                    onCheckedChange={(checked) =>
                      setEditedDefault(checked as boolean)
                    }
                  />
                  <Label className="cursor-pointer" htmlFor="edit-make-default">
                    Set as default filter
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleUpdateFilter}>Update</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </>
  );
}

// ChevronDown icon component
function ChevronDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
