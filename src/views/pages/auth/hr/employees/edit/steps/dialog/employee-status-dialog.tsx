import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useModelOnRequestHide } from "@/components/custom-ui/model/hook/useModelOnRequestHide";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import ButtonSpinner from "@/components/custom-ui/spinner/ButtonSpinner";
import { useState } from "react";
import PrimaryButton from "@/components/custom-ui/button/PrimaryButton";
import axiosClient from "@/lib/axois-client";
import { toast } from "@/components/ui/use-toast";
import { setServerError, validate } from "@/validation/validation";
import { useParams } from "react-router";
import NastranSpinner from "@/components/custom-ui/spinner/NastranSpinner";
import APICombobox from "@/components/custom-ui/combobox/APICombobox";
import CustomTextarea from "@/components/custom-ui/input/CustomTextarea";
import { EmployeeStatus } from "@/database/tables";

export interface EmployeeStatusDialogProps {
  onComplete: (employeeStatus: EmployeeStatus) => void;
}
export default function EmployeeStatusDialog(props: EmployeeStatusDialogProps) {
  const { onComplete } = props;
  const [storing, setStoring] = useState(false);
  const [error, setError] = useState(new Map<string, string>());
  const { id } = useParams();

  const [userData, setUserData] = useState<{
    status: { id: string; name: string } | undefined;
    detail: "";
  }>({
    status: undefined,
    detail: "",
  });
  const { modelOnRequestHide } = useModelOnRequestHide();
  const { t } = useTranslation();

  const add = async () => {
    try {
      if (storing) return;
      setStoring(true);
      // 1. Validate form
      const passed = await validate(
        [
          {
            name: "status",
            rules: ["required", "max:128", "min:3"],
          },
          {
            name: "detail",
            rules: ["required", "max:128", "min:15"],
          },
        ],
        userData,
        setError
      );
      if (!passed) {
        setStoring(false);
        return;
      }
      // 2. Store
      let formData = new FormData();
      if (id) formData.append("employee_id", id.toString());
      formData.append("detail", userData.detail);
      if (userData?.status)
        formData.append("status_type_id", userData.status.id);

      const response = await axiosClient.post(
        "employee/change-status",
        formData
      );
      if (response.status === 200) {
        toast({
          toastType: "SUCCESS",
          description: response.data.message,
        });
        const status = response.data.status;
        onComplete(status);
        modelOnRequestHide();
      }
    } catch (error: any) {
      toast({
        toastType: "ERROR",
        title: t("error"),
        description: error.response.data.message,
      });
      setServerError(error.response.data.errors, setError);
      console.log(error);
    } finally {
      setStoring(false);
    }
  };
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    if (userData) setUserData({ ...userData, [name]: value });
  };
  return (
    <Card className="w-full self-center [backdrop-filter:blur(20px)] bg-card dark:bg-card-secondary">
      <CardHeader className="relative text-start">
        <CardTitle className="rtl:text-4xl-rtl ltr:text-3xl-ltr text-tertiary">
          {t("change_status")}
        </CardTitle>
      </CardHeader>
      {storing ? (
        <NastranSpinner className=" mx-auto" />
      ) : (
        <CardContent className="flex flex-col mt-10 w-full md:w-[60%] gap-y-6 pb-12">
          <APICombobox
            requiredHint={`* ${t("required")}`}
            placeholderText={t("search_item")}
            errorText={t("no_item")}
            onSelect={(selection: any) => {
              setUserData({
                ...userData,
                status: selection,
              });
            }}
            lable={t("status")}
            required={true}
            selectedItem={userData?.status?.name}
            placeHolder={t("select_a")}
            errorMessage={error.get("status")}
            apiUrl={"block/statuse/types"}
            mode="single"
          />

          <CustomTextarea
            required={true}
            requiredHint={`* ${t("required")}`}
            lable={t("detail")}
            name="detail"
            defaultValue={userData["detail"]}
            placeholder={t("enter")}
            className="uppercase"
            errorMessage={error.get("detail")}
            onBlur={handleChange}
            rows={5}
          />
        </CardContent>
      )}
      <CardFooter className="flex justify-between">
        <Button
          className="rtl:text-xl-rtl ltr:text-lg-ltr"
          variant="outline"
          onClick={modelOnRequestHide}
        >
          {t("cancel")}
        </Button>
        <PrimaryButton
          disabled={storing}
          onClick={add}
          className={`${storing && "opacity-90"}`}
          type="submit"
        >
          <ButtonSpinner loading={storing}>{t("save")}</ButtonSpinner>
        </PrimaryButton>
      </CardFooter>
    </Card>
  );
}
