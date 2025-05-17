import Shimmer from "@/components/custom-ui/shimmer/Shimmer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { useGlobalState } from "@/context/GlobalStateContext";
import { Attendance, UserPermission } from "@/database/tables";
import { CACHE, PermissionEnum, PortalEnum } from "@/lib/constants";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router";
import axiosClient from "@/lib/axois-client";

import TableRowIcon from "@/components/custom-ui/table/TableRowIcon";
import Pagination from "@/components/custom-ui/table/Pagination";
import { setDateToURL } from "@/lib/utils";
import NastranModel from "@/components/custom-ui/model/NastranModel";
import PrimaryButton from "@/components/custom-ui/button/PrimaryButton";
import { ListFilter, Search } from "lucide-react";
import CustomInput from "@/components/custom-ui/input/CustomInput";
import SecondaryButton from "@/components/custom-ui/button/SecondaryButton";

import CustomSelect from "@/components/custom-ui/select/CustomSelect";
import { DateObject } from "react-multi-date-picker";
import useCacheDB from "@/lib/indexeddb/useCacheDB";
import CachedImage from "@/components/custom-ui/image/CachedImage";
import FilterDialog from "@/components/custom-ui/dialog/filter-dialog";
import { Order, UserSearch, UserSort } from "@/lib/types";
import { useAuthStore } from "@/stores/permission/auth-permssion-store";
import {
  Breadcrumb,
  BreadcrumbHome,
  BreadcrumbItem,
  BreadcrumbSeparator,
} from "@/components/custom-ui/Breadcrumb/Breadcrumb";
import AddAttendance from "./add-attendance";

export default function AttendancePage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLInputElement>(null);
  const { updateComponentCache, getComponentCache } = useCacheDB();
  const [searchParams] = useSearchParams();
  // Accessing individual search filters
  const searchValue = searchParams.get("sch_val");
  const searchColumn = searchParams.get("sch_col");
  const sort = searchParams.get("sort");
  const order = searchParams.get("order");
  const startDate = searchParams.get("st_dt");
  const endDate = searchParams.get("en_dt");
  const filters = {
    sort: sort == null ? "created_at" : sort,
    order: order == null ? "desc" : order,
    search: {
      column: searchColumn == null ? "username" : searchColumn,
      value: searchValue == null ? "" : searchValue,
    },
    date:
      startDate && endDate
        ? [
            new DateObject(new Date(startDate)),
            new DateObject(new Date(endDate)),
          ]
        : startDate
        ? [new DateObject(new Date(startDate))]
        : endDate
        ? [new DateObject(new Date(endDate))]
        : [],
  };
  const loadList = async (
    searchInput: string | undefined = undefined,
    count: number | undefined,
    page: number | undefined
  ) => {
    try {
      if (loading) return;
      setLoading(true);
      // 1. Organize date
      let dates = {
        startDate: startDate,
        endDate: endDate,
      };
      // 2. Send data
      const response = await axiosClient.get("api/attendance", {
        params: {
          page: page,
          per_page: count,
          filters: {
            sort: filters.sort,
            order: filters.order,
            search: {
              column: filters.search.column,
              value: searchInput,
            },
            date: dates,
          },
        },
      });
      const fetch = response.data.attendance.data as Attendance[];
      const lastPage = response.data.attendance.last_page;
      const totalItems = response.data.attendance.total;
      const perPage = response.data.attendance.per_page;
      const currentPage = response.data.attendance.current_page;
      setAttendance({
        filterList: {
          data: fetch,
          lastPage: lastPage,
          totalItems: totalItems,
          perPage: perPage,
          currentPage: currentPage,
        },
        unFilterList: {
          data: fetch,
          lastPage: lastPage,
          totalItems: totalItems,
          perPage: perPage,
          currentPage: currentPage,
        },
      });
    } catch (error: any) {
      toast({
        toastType: "ERROR",
        title: t("error"),
        description: error.response.data.message,
      });
    } finally {
      setLoading(false);
    }
  };
  const initialize = async (
    searchInput: string | undefined = undefined,
    count: number | undefined,
    page: number | undefined
  ) => {
    if (!count) {
      const countSore = await getComponentCache(
        CACHE.ATTENDANCE_TABLE_PAGINATION_COUNT
      );
      count = countSore?.value ? countSore.value : 10;
    }
    if (!searchInput) {
      searchInput = filters.search.value;
    }
    if (!page) {
      page = 1;
    }
    loadList(searchInput, count, page);
  };
  useEffect(() => {
    initialize(undefined, undefined, 1);
  }, [sort, startDate, endDate, order]);
  const [attendance, setAttendance] = useState<{
    filterList: AttendancePaginationData;
    unFilterList: AttendancePaginationData;
  }>({
    filterList: {
      data: [],
      lastPage: 1,
      totalItems: 0,
      perPage: 0,
      currentPage: 0,
    },
    unFilterList: {
      data: [],
      lastPage: 1,
      totalItems: 0,
      perPage: 0,
      currentPage: 0,
    },
  });
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const [state] = useGlobalState();

  const addItem = (attendance: Attendance) => {
    setAttendance((prevState) => ({
      filterList: {
        ...prevState.filterList,
        data: [attendance, ...prevState.filterList.data],
      },
      unFilterList: {
        ...prevState.unFilterList,
        data: [attendance, ...prevState.unFilterList.data],
      },
    }));
  };

  const skeleton = (
    <TableRow>
      <TableCell>
        <Shimmer className="h-[24px] w-full rounded-sm" />
      </TableCell>
      <TableCell>
        <Shimmer className="h-[24px] w-full rounded-sm" />
      </TableCell>
      <TableCell>
        <Shimmer className="h-[24px] w-full rounded-sm" />
      </TableCell>
      <TableCell>
        <Shimmer className="h-[24px] w-full rounded-sm" />
      </TableCell>
      <TableCell>
        <Shimmer className="h-[24px] w-full rounded-sm" />
      </TableCell>
      <TableCell>
        <Shimmer className="h-[24px] w-full rounded-sm" />
      </TableCell>
      <TableCell>
        <Shimmer className="h-[24px] w-full rounded-sm" />
      </TableCell>
    </TableRow>
  );
  const per: UserPermission = user?.permissions[PortalEnum.hr].get(
    PermissionEnum.users.name
  ) as UserPermission;
  const hasView = per?.view;
  const hasAdd = per?.add;

  const watchOnClick = async (attendance: Attendance) => {
    const attendanceId = attendance.id;
    navigate(`/attendance${attendanceId}`);
  };
  return (
    <>
      <Breadcrumb className="mx-2 mt-2">
        <BreadcrumbHome />
        <BreadcrumbSeparator />
        <BreadcrumbItem>{t("attendance")}</BreadcrumbItem>
      </Breadcrumb>
      <div className="flex flex-col sm:items-baseline sm:flex-row rounded-md bg-card gap-2  px-2 py-2 mt-4">
        {hasAdd && (
          <NastranModel
            size="lg"
            isDismissable={false}
            button={
              <PrimaryButton className="rtl:text-lg-rtl font-semibold ltr:text-md-ltr">
                {t("add")}
              </PrimaryButton>
            }
            showDialog={async () => true}
          >
            <AddAttendance />
          </NastranModel>
        )}

        <CustomInput
          size_="lg"
          placeholder={`${t(filters.search.column)}...`}
          parentClassName="sm:flex-1 col-span-3"
          type="text"
          ref={searchRef}
          startContent={
            <Search className="size-[18px] mx-auto rtl:mr-[4px] text-primary pointer-events-none" />
          }
          endContent={
            <SecondaryButton
              onClick={async () => {
                if (searchRef.current != undefined)
                  await initialize(
                    searchRef.current.value,
                    undefined,
                    undefined
                  );
              }}
              className="w-[72px] absolute rtl:left-[6px] ltr:right-[6px] -top-[7px] h-[32px] rtl:text-sm-rtl ltr:text-md-ltr hover:shadow-sm shadow-lg"
            >
              {t("search")}
            </SecondaryButton>
          }
        />
        <div className="sm:px-4 col-span-3 flex-1 self-start sm:self-baseline flex justify-end items-center">
          <NastranModel
            size="lg"
            isDismissable={false}
            button={
              <SecondaryButton
                className="px-8 rtl:text-md-rtl ltr:text-md-ltr"
                type="button"
              >
                {t("filter")}
                <ListFilter className="text-secondary mx-2 size-[15px]" />
              </SecondaryButton>
            }
            showDialog={async () => true}
          >
            <FilterDialog
              filters={filters}
              sortOnComplete={async (filterName: UserSort) => {
                if (filterName != filters.sort) {
                  const queryParams = new URLSearchParams();
                  queryParams.set("sort", filterName);
                  queryParams.set("order", filters.order);
                  queryParams.set("sch_col", filters.search.column);
                  queryParams.set("sch_val", filters.search.value);
                  setDateToURL(queryParams, filters.date);
                  navigate(`/users?${queryParams.toString()}`, {
                    replace: true,
                  });
                }
              }}
              searchFilterChanged={async (filterName: UserSearch) => {
                if (filterName != filters.search.column) {
                  const queryParams = new URLSearchParams();
                  queryParams.set("sort", filters.sort);
                  queryParams.set("order", filters.order);
                  queryParams.set("sch_col", filterName);
                  queryParams.set("sch_val", filters.search.value);
                  setDateToURL(queryParams, filters.date);
                  navigate(`/users?${queryParams.toString()}`, {
                    replace: true,
                  });
                }
              }}
              orderOnComplete={async (filterName: Order) => {
                if (filterName != filters.order) {
                  const queryParams = new URLSearchParams();
                  queryParams.set("sort", filters.sort);
                  queryParams.set("order", filterName);
                  queryParams.set("sch_col", filters.search.column);
                  queryParams.set("sch_val", filters.search.value);
                  setDateToURL(queryParams, filters.date);
                  navigate(`/users?${queryParams.toString()}`, {
                    replace: true,
                  });
                }
              }}
              dateOnComplete={(selectedDates: DateObject[]) => {
                if (selectedDates.length == 2) {
                  const queryParams = new URLSearchParams();
                  queryParams.set("order", filters.order);
                  queryParams.set("sort", filters.sort);
                  queryParams.set("sch_col", filters.search.column);
                  queryParams.set("sch_val", filters.search.value);
                  setDateToURL(queryParams, selectedDates);
                  navigate(`/attendance?${queryParams.toString()}`, {
                    replace: true,
                  });
                }
              }}
              filtersShowData={{
                sort: [
                  {
                    name: "created_at",
                    translate: t("date"),
                    onClick: () => {},
                  },
                  {
                    name: "username",
                    translate: t("username"),
                    onClick: () => {},
                  },
                  {
                    name: "action",
                    translate: t("action"),
                    onClick: () => {},
                  },
                ],
                order: [
                  {
                    name: "asc",
                    translate: t("asc"),
                    onClick: () => {},
                  },
                  {
                    name: "desc",
                    translate: t("desc"),
                    onClick: () => {},
                  },
                ],
                search: [
                  {
                    name: "hr_code",
                    translate: t("hr_code"),
                    onClick: () => {},
                  },
                  {
                    name: "username",
                    translate: t("username"),
                    onClick: () => {},
                  },
                ],
              }}
              showColumns={{
                sort: true,
                order: true,
                search: true,
                date: true,
              }}
            />
          </NastranModel>
        </div>
        <CustomSelect
          paginationKey={CACHE.ATTENDANCE_TABLE_PAGINATION_COUNT}
          options={[
            { value: "10", label: "10" },
            { value: "20", label: "20" },
            { value: "50", label: "50" },
          ]}
          className="w-fit sm:self-baseline"
          updateCache={updateComponentCache}
          getCache={async () =>
            await getComponentCache(CACHE.ATTENDANCE_TABLE_PAGINATION_COUNT)
          }
          placeholder={`${t("select")}...`}
          emptyPlaceholder={t("no_options_found")}
          rangePlaceholder={t("count")}
          onChange={async (value: string) =>
            await initialize(undefined, parseInt(value), undefined)
          }
        />
      </div>
      <Table className="bg-card rounded-md my-[2px] py-8">
        <TableHeader className="rtl:text-3xl-rtl ltr:text-xl-ltr">
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-start px-1">{t("profile")}</TableHead>
            <TableHead className="text-center px-1 ">{t("hr_code")}</TableHead>
            <TableHead className="text-start">{t("name")}</TableHead>
            <TableHead className="text-start">{t("check_in_time")}</TableHead>
            <TableHead className="text-start">{t("check_out_time")}</TableHead>
            <TableHead className="text-start">{t("description")}</TableHead>
            <TableHead className="text-start">{t("status")}</TableHead>

            <TableHead className="text-start w-[60px]">{t("action")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="rtl:text-xl-rtl ltr:text-2xl-ltr">
          {loading ? (
            <>{skeleton}</>
          ) : (
            attendance.filterList.data.map(
              (item: Attendance, index: number) => (
                <TableRowIcon
                  read={hasView}
                  remove={false}
                  edit={false}
                  onEdit={async () => {}}
                  key={index}
                  item={item}
                  onRemove={async () => {}}
                  onRead={watchOnClick}
                >
                  <TableCell className="px-1 py-0">
                    <CachedImage
                      src={item?.picture}
                      alt="Avatar"
                      ShimmerIconClassName="size-[18px]"
                      shimmerClassName="size-[36px] mx-auto shadow-lg border border-tertiary rounded-full"
                      className="size-[36px] object-center object-cover mx-auto shadow-lg border border-tertiary rounded-full"
                      routeIdentifier={"profile"}
                    />
                  </TableCell>
                  <TableCell className="rtl:text-md-rtl truncate px-1 py-0">
                    {item.hr_code}
                  </TableCell>

                  <TableCell className="rtl:text-md-rtl truncate px-1 py-0">
                    {item.employee_name}
                  </TableCell>
                  <TableCell>
                    <h1 className="truncate">{item.check_in_time}</h1>
                  </TableCell>
                  <TableCell dir="ltr" className="truncate">
                    {item.check_out_time}
                  </TableCell>
                  <TableCell dir="ltr" className="truncate">
                    {item.description}
                  </TableCell>
                  <TableCell dir="ltr" className="truncate">
                    {item.status}
                  </TableCell>
                </TableRowIcon>
              )
            )
          )}
        </TableBody>
      </Table>
      <div className="flex justify-between rounded-md bg-card  p-3 items-center">
        <h1 className="rtl:text-lg-rtl ltr:text-md-ltr font-medium">{`${t(
          "page"
        )} ${attendance.unFilterList.currentPage} ${t("of")} ${
          attendance.unFilterList.lastPage
        }`}</h1>
        <Pagination
          lastPage={attendance.unFilterList.lastPage}
          onPageChange={async (page) =>
            await initialize(undefined, undefined, page)
          }
        />
      </div>
    </>
  );
}
