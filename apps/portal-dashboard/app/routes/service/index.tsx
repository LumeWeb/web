import {
  Authenticated,
  useGo,
  useNavigation,
  useParsed,
} from "@refinedev/core";
import { GeneralLayout } from "@/components/layout/GeneralLayout";
import { DataTable } from "@/components/DataTable.js";
import { AddIcon } from "@/components/icons.js";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronRight, Search, X } from "lucide-react";
import PinDialog from "./components/PinDialog";
import { useActiveService } from "./hooks/useActiveService";
import { IPFS_SUBFOLDER_ROUTE, SERVICE_ROUTE } from "@/routeConfig.js";
import { CID } from "multiformats/cid";
import { BreadCrumbPath } from "@/services/base.js";
import { useNavigate, useSearchParams } from "@remix-run/react";

export default function Service() {
  return (
    <Authenticated key="service" v3LegacyAuthProviderCompatible={false}>
      <GeneralLayout>
        <FileManager />
      </GeneralLayout>
    </Authenticated>
  );
}

const FileManager = () => {
  const svc = useActiveService();
  const go = useGo();
  const [showPinDialog, setShowPinDialog] = useState(false);
  const parsed = useParsed();
  const nav = useNavigation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [folderCid, setFolderCid] = useState<string | undefined>();
  const [currentPath, setCurrentPath] = useState<BreadCrumbPath>([]);

  const breadcrumbHook = svc?.UIFileManagerCurrentBreadcrumbPathHook();
  const navigateToCID = svc?.UINavigateToCIDHook();

  useEffect(() => {
    if (!svc) {
      go({
        to: "/dashboard",
      });
    }
  }, [svc, go]);

  useEffect(() => {
    if (!parsed.id) {
      return;
    }

    if (parsed.resource?.name !== IPFS_SUBFOLDER_ROUTE) {
      setFolderCid(undefined);
      setCurrentPath([]);
      return;
    }

    try {
      CID.parse(parsed?.id as string);
    } catch (e) {
      nav.list(svc?.id()!);
      return;
    }

    setFolderCid(parsed.id as string);

    breadcrumbHook?.()?.then((path) => {
      setCurrentPath(path);
    });
  }, [parsed.id]);

  const searchQuery = useMemo(
    () => searchParams.get("q") || "",
    [searchParams],
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchParams(
        (prev) => {
          const newParams = new URLSearchParams(prev);
          if (value) {
            newParams.set("q", value);
          } else {
            newParams.delete("q");
          }
          return newParams;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const clearSearch = useCallback(() => {
    handleSearchChange("");
  }, [handleSearchChange]);

  const navigateToBreadcrumb = useCallback(
    (index: number) => {
      if (index === -1) {
        nav.show(SERVICE_ROUTE, svc?.id() as string);
        return;
      }

      const cid = currentPath[index].cid;
      navigateToCID?.(cid);
    },
    [nav, svc, currentPath, navigateToCID],
  );

  if (!svc) {
    return null;
  }

  return (
    <>
      <h2 className="font-bold text-l mt-8">Files</h2>
      <div className="flex items-center space-x-4 my-6 w-full">
        <Input
          fullWidth
          leftIcon={<Search />}
          value={searchQuery}
          after={
            searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                onClick={clearSearch}>
                <X className="h-4 w-4" />
              </Button>
            )
          }
          placeholder="Search files by name or CID"
          className="border-ring font-medium w-full grow h-12 flex-1 bg-primary-2/10"
          onChange={(e) => handleSearchChange(e.target.value)}
        />
        <Button className="h-12 gap-x-2" onClick={() => setShowPinDialog(true)}>
          <AddIcon />
          Pin Content
        </Button>
      </div>
      <nav className="flex mb-4 overflow-x-auto" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Button
              variant="link"
              className="inline-flex items-center text-sm font-medium"
              onClick={() => navigateToBreadcrumb(-1)}>
              Home
            </Button>
          </li>
          {currentPath.map((folder, index) => (
            <li key={folder.cid.toString()}>
              <div className="flex items-center">
                <ChevronRight className="w-5 h-5 text-gray-400" />
                <Button
                  variant="link"
                  className="ml-1 text-sm font-medium"
                  onClick={() => navigateToBreadcrumb(index)}>
                  {folder.name}
                </Button>
              </div>
            </li>
          ))}
        </ol>
      </nav>
      <DataTable
        columns={svc.UIFileManagerColumns()}
        resource={svc.id()}
        dataProviderName={svc.id()}
        filters={[...svc?.UIGetSearchFilters(searchQuery)]}
        permanentFilters={[
          {
            field: "status",
            value: "pinned",
            operator: "eq",
          },
        ]}
        meta={{
          fileManager: true,
          parentCid: folderCid,
        }}
      />
      <PinDialog open={showPinDialog} stateChange={setShowPinDialog} />
    </>
  );
};
