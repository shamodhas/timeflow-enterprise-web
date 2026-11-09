import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { showToast } from "../utils/toast"
import {
  createEmployee,
  deleteEmployee,
  getEmployees,
  getPendingEmployees,
  updateEmployee,
  updateEmployeeStatus
} from "../services/employee.service"
import {
  createDepartment,
  getDepartments
} from "../services/department.service"
import { getLeaveTypes } from "../services/leave.service"
import { ResponsiveTable, type Column } from "../components/ResponsiveTable"

interface Department {
  id: string
  name: string
}

interface LeaveType {
  id: string
  name: string
  defaultQuota: number
}

interface EmployeeData {
  id: string
  employeeCode: string
  fullName: string
  email: string
  role: string
  departmentId: string | null
  department: { name: string } | null
}

interface PendingEmployee {
  id: string
  employeeCode: string
  fullName: string
  email: string
  role: string
  createdAt: string
}

export const Employees = () => {
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "PENDING">("ACTIVE")
  const [employees, setEmployees] = useState<EmployeeData[]>([])
  const [pendingEmployees, setPendingEmployees] = useState<PendingEmployee[]>(
    []
  )
  const [departments, setDepartments] = useState<Department[]>([])
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([])
  const [loading, setLoading] = useState(true)

  const navigate = useNavigate()

  const [showEmpModal, setShowEmpModal] = useState(false)
  const [showDeptModal, setShowDeptModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editEmployeeId, setEditEmployeeId] = useState<string | null>(null)

  const [employeeCode, setEmployeeCode] = useState("")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("EMPLOYEE")
  const [departmentId, setDepartmentId] = useState("")
  const [initialLeaves, setInitialLeaves] = useState<{ [key: string]: number }>(
    {}
  )
  const [deptName, setDeptName] = useState("")

  const fetchData = async () => {
    try {
      const [empRes, deptRes, leavTypRes, pendingRes] = await Promise.all([
        getEmployees(),
        getDepartments(),
        getLeaveTypes(),
        getPendingEmployees()
      ])
      setEmployees(empRes)
      setDepartments(deptRes)
      setLeaveTypes(leavTypRes)
      setPendingEmployees(pendingRes)

      if (deptRes.length > 0 && !departmentId) {
        setDepartmentId(deptRes[0].id)
      }
    } catch (error) {
      console.error("Failed to fetch data", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAccountStatus = async (
    id: string,
    status: "ACTIVE" | "REJECTED"
  ) => {
    if (
      !window.confirm(
        `Are you sure you want to ${status.toLowerCase()} this account request?`
      )
    )
      return
    try {
      await updateEmployeeStatus(id, status)
      showToast.success(`Account ${status.toLowerCase()} successfully!`)
      fetchData()
    } catch (error: any) {
      showToast.error(
        error.response?.data?.message ||
          `Failed to ${status.toLowerCase()} account`
      )
    }
  }

  const handleOpenAddModal = () => {
    setIsEditing(false)
    setEditEmployeeId(null)
    setEmployeeCode("")
    setFullName("")
    setEmail("")
    setPassword("")
    setRole("EMPLOYEE")
    setInitialLeaves({})
    if (departments.length > 0) setDepartmentId(departments[0].id)
    setShowEmpModal(true)
  }

  const handleOpenEditModal = (emp: EmployeeData) => {
    setIsEditing(true)
    setEditEmployeeId(emp.id)
    setEmployeeCode(emp.employeeCode)
    setFullName(emp.fullName)
    setEmail(emp.email)
    setRole(emp.role)
    setDepartmentId(emp.departmentId || "")
    setShowEmpModal(true)
  }

  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (isEditing && editEmployeeId) {
        await updateEmployee(editEmployeeId, {
          employeeCode,
          fullName,
          email,
          role,
          departmentId: departmentId || null
        })
        showToast.success("Employee updated successfully!")
      } else {
        await createEmployee({
          employeeCode,
          fullName,
          email,
          password,
          role,
          departmentId: departmentId || null,
          initialLeaves
        })
        showToast.success("Employee created successfully!")
      }

      setShowEmpModal(false)
      fetchData()
    } catch (error: any) {
      showToast.error(error.response?.data?.message || "Operation failed")
    }
  }

  const handleDeleteEmployee = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this employee?"))
      return
    try {
      await deleteEmployee(id)
      showToast.success("Employee deleted successfully!")
      fetchData()
    } catch (error: any) {
      showToast.error(
        error.response?.data?.message || "Failed to delete employee"
      )
    }
  }

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createDepartment(deptName)
      showToast.success("Department created successfully!")
      setShowDeptModal(false)
      setDeptName("")
      fetchData()
    } catch (error: any) {
      showToast.error(
        error.response?.data?.message || "Failed to create department"
      )
    }
  }

  const activeEmployeeColumns: Column<EmployeeData>[] = [
    {
      header: "Code",
      accessor: (emp) => (
        <span className="font-semibold text-slate-900">
          {emp.employeeCode}
        </span>
      )
    },
    {
      header: "Name",
      accessor: (emp) => (
        <span className="font-bold text-slate-900">{emp.fullName}</span>
      )
    },
    {
      header: "Email",
      accessor: (emp) => (
        <span className="text-slate-600 text-xs font-mono">{emp.email}</span>
      )
    },
    {
      header: "Department",
      accessor: (emp) => (
        <span className="text-slate-600 font-medium">
          {emp.department?.name || "N/A"}
        </span>
      )
    },
    {
      header: "Role",
      accessor: (emp) => (
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 uppercase tracking-wide">
          {emp.role}
        </span>
      )
    },
    {
      header: "Actions",
      accessor: (emp) => (
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(`/app/employees/${emp.id}/leaves`)}
            className="text-blue-600 hover:underline font-semibold text-xs"
          >
            Leave Summary
          </button>
          <button
            onClick={() => handleOpenEditModal(emp)}
            className="text-amber-600 hover:underline font-semibold text-xs"
          >
            Edit
          </button>
          <button
            onClick={() => handleDeleteEmployee(emp.id)}
            className="text-red-600 hover:underline font-semibold text-xs"
          >
            Delete
          </button>
        </div>
      )
    }
  ]

  const pendingEmployeeColumns: Column<PendingEmployee>[] = [
    {
      header: "Code",
      accessor: (emp) => (
        <span className="font-semibold text-slate-900">
          {emp.employeeCode}
        </span>
      )
    },
    {
      header: "Requested By",
      accessor: (emp) => (
        <span className="font-bold text-slate-900">{emp.fullName}</span>
      )
    },
    {
      header: "Email",
      accessor: (emp) => (
        <span className="text-slate-600 text-xs font-mono">{emp.email}</span>
      )
    },
    {
      header: "Requested Role",
      accessor: (emp) => (
        <span className="rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-bold text-yellow-800 uppercase tracking-wide">
          {emp.role}
        </span>
      )
    },
    {
      header: "Date",
      accessor: (emp) => (
        <span className="text-slate-500 font-mono text-xs">
          {new Date(emp.createdAt).toLocaleDateString()}
        </span>
      )
    },
    {
      header: "Actions",
      accessor: (emp) => (
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleAccountStatus(emp.id, "ACTIVE")}
            className="text-green-600 hover:underline font-semibold text-xs"
          >
            Approve
          </button>
          <button
            onClick={() => handleAccountStatus(emp.id, "REJECTED")}
            className="text-red-600 hover:underline font-semibold text-xs"
          >
            Reject
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Employee Management
        </h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowDeptModal(true)}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            + Add Department
          </button>
          <button
            onClick={handleOpenAddModal}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors cursor-pointer"
          >
            + Add Employee
          </button>
        </div>
      </div>

      <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("ACTIVE")}
                className={`py-3 px-3 sm:px-6 whitespace-nowrap  text-sm font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === "ACTIVE"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600"
          }`}
        >
          Active Employees
        </button>
        <button
          onClick={() => setActiveTab("PENDING")}
          className={`py-3 px-3 sm:px-6 whitespace-nowrap text-sm font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === "PENDING"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600"
          }`}
        >
          Pending Requests
          {pendingEmployees.length > 0 && (
            <span className="bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 py-0.5 px-2 rounded-full text-xs font-extrabold">
              {pendingEmployees.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === "ACTIVE" && (
        <ResponsiveTable
          data={employees}
          columns={activeEmployeeColumns}
          keyExtractor={(emp) => emp.id}
          loading={loading}
          emptyMessage="No active employees found."
        />
      )}

      {activeTab === "PENDING" && (
        <ResponsiveTable
          data={pendingEmployees}
          columns={pendingEmployeeColumns}
          keyExtractor={(emp) => emp.id}
          loading={loading}
          emptyMessage="No pending requests."
        />
      )}

      {showEmpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-black/70 backdrop-blur-xs overflow-y-auto p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl my-8 border border-slate-100 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              {isEditing
                ? "Edit Employee Details"
                : "Add New Employee & Initial Leaves"}
            </h2>
            <form onSubmit={handleSaveEmployee} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Employee Code
                  </label>
                  <input
                    type="text"
                    required
                    value={employeeCode}
                    onChange={(e) => setEmployeeCode(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 outline-none focus:border-blue-500 text-sm font-medium text-slate-700 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 outline-none focus:border-blue-500 text-sm font-medium text-slate-700 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 outline-none focus:border-blue-500 text-sm font-medium text-slate-700 dark:text-slate-200"
                  />
                </div>
                {!isEditing && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 outline-none focus:border-blue-500 text-sm font-medium text-slate-700 dark:text-slate-200"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Department
                  </label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 outline-none focus:border-blue-500 text-sm font-medium text-slate-700 dark:text-slate-200"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 outline-none focus:border-blue-500 text-sm font-medium text-slate-700 dark:text-slate-200"
                  >
                    <option value="EMPLOYEE">EMPLOYEE</option>
                    <option value="HR">HR</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
              </div>

              {!isEditing && (
                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Initial Leave Quotas (Days)
                  </h3>
                  <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto p-1">
                    {leaveTypes.map((lt) => (
                      <div
                        key={lt.id}
                        className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700"
                      >
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          {lt.name}
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          placeholder={String(lt.defaultQuota || 0)}
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 p-2 text-sm bg-white dark:bg-slate-900 outline-none focus:border-blue-500 font-medium text-slate-700 dark:text-slate-200"
                          onChange={(e) =>
                            setInitialLeaves({
                              ...initialLeaves,
                              [lt.id]: Number(e.target.value)
                            })
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEmpModal(false)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  {isEditing ? "Save Changes" : "Create Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-100 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              Add Department
            </h2>
            <form onSubmit={handleCreateDepartment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Department Name
                </label>
                <input
                  type="text"
                  required
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 outline-none focus:border-blue-500 text-sm font-medium text-slate-700 dark:text-slate-200"
                  placeholder="E.g. Engineering"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDeptModal(false)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
