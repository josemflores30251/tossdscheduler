import React, { useState } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const EmployeeScheduler = () => {
  const locations = ["Downtown", "Midtown", "Uptown", "Suburb"];
  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const [schedules, setSchedules] = useState(() =>
    daysOfWeek.reduce((acc, day) => {
      acc[day] = locations.reduce((locAcc, loc) => {
        locAcc[loc] = { shifts: [], salesProjection: 0 };
        return locAcc;
      }, {});
      return acc;
    }, {})
  );
  const [currentDay, setCurrentDay] = useState("Monday");
  const [employeeName, setEmployeeName] = useState("");

  const addEmployee = (location) => {
    if (employeeName.trim()) {
      setSchedules((prev) => ({
        ...prev,
        [currentDay]: {
          ...prev[currentDay],
          [location]: {
            ...prev[currentDay][location],
            shifts: [...prev[currentDay][location].shifts, employeeName],
          },
        },
      }));
      setEmployeeName("");
    }
  };

  const removeEmployee = (location, index) => {
    setSchedules((prev) => {
      const newShifts = [...prev[currentDay][location].shifts];
      newShifts.splice(index, 1);
      return {
        ...prev,
        [currentDay]: {
          ...prev[currentDay],
          [location]: {
            ...prev[currentDay][location],
            shifts: newShifts,
          },
        },
      };
    });
  };

  const updateSalesProjection = (location, value) => {
    setSchedules((prev) => ({
      ...prev,
      [currentDay]: {
        ...prev[currentDay],
        [location]: {
          ...prev[currentDay][location],
          salesProjection: Number(value),
        },
      },
    }));
  };

  const exportToPDF = () => {
    const input = document.getElementById("scheduler");
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${currentDay}_schedule.pdf`);
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <select
          value={currentDay}
          onChange={(e) => setCurrentDay(e.target.value)}
          className="border p-2 rounded"
        >
          {daysOfWeek.map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </select>
        <button
          onClick={exportToPDF}
          className="bg-green-500 text-white p-2 rounded"
        >
          Export to PDF
        </button>
      </div>

      <div id="scheduler" className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {locations.map((location) => (
          <div key={location} className="border p-4 rounded shadow">
            <h2 className="text-lg font-bold mb-2">{location}</h2>

            <input
              type="text"
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              placeholder="Employee Name"
              className="border p-2 rounded w-full mb-2"
            />

            <button
              onClick={() => addEmployee(location)}
              className="bg-blue-500 text-white p-2 rounded w-full mb-4"
            >
              Add Employee
            </button>

            <input
              type="number"
              value={schedules[currentDay][location].salesProjection}
              onChange={(e) => updateSalesProjection(location, e.target.value)}
              placeholder="Sales Projection ($)"
              className="border p-2 rounded w-full mb-4"
            />

            <ul>
              {schedules[currentDay][location].shifts.map((emp, idx) => (
                <li
                  key={idx}
                  className="flex justify-between items-center mb-1"
                >
                  {emp}
                  <button
                    onClick={() => removeEmployee(location, idx)}
                    className="text-red-500"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>

            {/* Understaff Warning */}
            {schedules[currentDay][location].shifts.length <
              Math.ceil(
                schedules[currentDay][location].salesProjection / 100
              ) && <p className="text-red-500 mt-2">⚠ Understaffed</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeScheduler;
