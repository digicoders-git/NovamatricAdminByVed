import React, { useEffect, useState } from "react";
import axios from "axios";
import "./CSS/SurveyResponses.css";
import DashboardLayout from "./Dashboard";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";   // ✅ FIXED IMPORT

export default function SurveyResponses() {
    const [questions, setQuestions] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const navigate = useNavigate();
    const surveyId = window.location.pathname.split("/").pop();
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const loadData = async () => {
            try {
                const surveyRes = await axios.get(`${API_URL}/api/survey/getServey/${surveyId}`);
                const surveyData = surveyRes.data.data;
                setQuestions(surveyData.questions || []);

                const submissionRes = await axios.get(
                    `${API_URL}/api/submission/survey/${surveyId}`
                );
                setSubmissions(submissionRes.data.data || []);
            } catch (error) {
                console.error(error);
            }
            setLoading(false);
        };

        loadData();
    }, []);

    // Prepare export data
    const prepareExportData = () => {
        return submissions.map((s, index) => {
            const row = {
                "Sr No.": index + 1,
            };

            questions.forEach((q) => {
                const ans = s.responses.find((r) => r.questionId === q._id);
                row[q.questionText] = ans ? ans.answer : "-";
            });

            row["Submitted At"] = new Date(s.submittedAt).toLocaleString();
            return row;
        });
    };

    // Export to Excel
    const exportToExcel = () => {
        const data = prepareExportData();
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Survey Responses");

        const maxWidth = 50;
        const colWidths = Object.keys(data[0] || {}).map((key) => ({
            wch: Math.min(maxWidth, Math.max(key.length, 10)),
        }));
        ws["!cols"] = colWidths;

        XLSX.writeFile(wb, `survey_responses_${surveyId}.xlsx`);
    };

    // Export to CSV
    const exportToCSV = () => {
        const data = prepareExportData();
        const ws = XLSX.utils.json_to_sheet(data);
        const csv = XLSX.utils.sheet_to_csv(ws);

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `survey_responses_${surveyId}.csv`;
        link.click();
    };

    // Export to PDF
    const exportToPDF = () => {
        const doc = new jsPDF("l", "mm", "a4");

        doc.setFontSize(16);
        doc.text("Survey Responses", 14, 15);
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

        const headers = [
            "Sr No.",
            ...questions.map((q) => q.questionText),
            "Submitted At",
        ];

        const rows = submissions.map((s, index) => {
            const row = [index + 1];

            questions.forEach((q) => {
                const ans = s.responses.find((r) => r.questionId === q._id);
                row.push(ans ? ans.answer : "-");
            });

            row.push(new Date(s.submittedAt).toLocaleString());
            return row;
        });

        autoTable(doc, {
            head: [headers],
            body: rows,
            startY: 28,
            styles: { fontSize: 8, cellPadding: 2 },
        });

        doc.save(`survey_responses_${surveyId}.pdf`);
    };

    if (loading) return <p className="submission-loading">Loading...</p>;
    if (!questions.length) return <p className="submission-no-data">No questions found</p>;

    const totalPages = Math.ceil(submissions.length / rowsPerPage);
    const paginatedData = submissions.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const changePage = (p) => {
        if (p >= 1 && p <= totalPages) setCurrentPage(p);
    };

    return (
        <DashboardLayout>
            <div className="submission-container">
                <div className="submission-header-actions">
                    <button onClick={() => navigate(-1)} className="survey-full-back-btn">
                        ← Back
                    </button>

                    <div className="export-buttons">
                        <button
                            onClick={exportToExcel}
                            className="export-btn excel-btn"
                            disabled={submissions.length === 0}
                        >
                            📊 Export Excel
                        </button>
                        <button
                            onClick={exportToCSV}
                            className="export-btn csv-btn"
                            disabled={submissions.length === 0}
                        >
                            📄 Export CSV
                        </button>
                        <button
                            onClick={exportToPDF}
                            className="export-btn pdf-btn"
                            disabled={submissions.length === 0}
                        >
                            📑 Export PDF
                        </button>
                    </div>
                </div>

                <h2 className="submission-title">Survey Responses</h2>

                <div className="submission-table-wrapper">
                    <table className="submission-table">
                        <thead>
                            <tr>
                                <th className="submission-header">Sr No.</th>
                                {questions.map((q) => (
                                    <th key={q._id} className="submission-header">
                                        {q.questionText}
                                    </th>
                                ))}
                                <th className="submission-header">Submitted At</th>
                            </tr>
                        </thead>

                        <tbody>
                            {paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan={questions.length + 2} className="submission-no-data">
                                        No submissions
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((s, index) => (
                                    <tr key={s._id} className="submission-row">
                                        <td className="submission-cell">
                                            {(currentPage - 1) * rowsPerPage + index + 1}
                                        </td>

                                        {questions.map((q) => {
                                            const ans = s.responses.find(
                                                (r) => r.questionId === q._id
                                            );
                                            return (
                                                <td key={q._id} className="submission-cell">
                                                    {ans ? ans.answer : "-"}
                                                </td>
                                            );
                                        })}

                                        <td className="submission-cell">
                                            {new Date(s.submittedAt).toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="pagination-container">
                    <button
                        className="pagination-btn"
                        onClick={() => changePage(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>

                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i}
                            className={`pagination-btn ${currentPage === i + 1 ? "active" : ""}`}
                            onClick={() => changePage(i + 1)}
                        >
                            {i + 1}
                        </button>
                    ))}

                    <button
                        className="pagination-btn"
                        onClick={() => changePage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
}
