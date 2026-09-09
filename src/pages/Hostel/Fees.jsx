import RecordWorkspace from "../../components/Admin/RecordWorkspace";
import {
  studentNameForRecord,
  useAdminWorkspace,
} from "../../lib/adminWorkspace";
import "./Fees.css";

const studentNameOf = (fee, students) =>
  studentNameForRecord(students, fee, fee.fullName || fee.student?.name || "—");

const totalAmountOf = (fee) =>
  fee.amount ?? fee.totalAmount ?? fee.totalFee ?? fee.feesPerSemester ?? fee.feeAmount ?? 0;

const paidThisMonthOf = (fee) =>
  fee.paidThisMonth ?? fee.feesPaidThisMonth ?? (
    Number(fee.paidAmount ?? fee.amountPaid ?? fee.paid ?? 0) > 0
      ? fee.paidAmount ?? fee.amountPaid ?? fee.paid
      : 0
  );

const paidOnOf = (fee) =>
  fee.paidOn || fee.paymentDate || fee.paidAt || fee.updatedAt || fee.createdAt || "";

const dateOnly = (value) => {
  if (!value) return "—";
  if (typeof value === "string" && value.includes("T")) return value.split("T")[0];
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString();
};

export default function Fees() {
  const { data, admin, filterByStudent } = useAdminWorkspace();
  const fields = [
    {
      name: "studentName",
      label: "Student",
      short: "Student Name",
    },
    { name: "totalAmount", label: "Total Amount" },
    { name: "paidThisMonth", label: "Paid This Month" },
    { name: "paidOn", label: "Paid On" },
    {
      name: "status",
      label: "Status",
    },
  ];
  const rows = filterByStudent(data.hostelFees).map((fee) => ({
    ...fee,
    studentName: studentNameOf(fee, admin.students),
    totalAmount: totalAmountOf(fee),
    paidThisMonth: paidThisMonthOf(fee),
    paidOn: dateOnly(paidOnOf(fee)),
  }));

  return (
    <RecordWorkspace
      title="Fees"
      rows={rows}
      fields={fields}
      prefix="FEE"
      readOnly
    />
  );
}
