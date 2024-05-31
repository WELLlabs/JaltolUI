// src/components/DownloadCSVButton.jsx
import Papa from 'papaparse';
import PropTypes from 'prop-types';

const DownloadCSVButton = ({ data, filename }) => {
  const downloadCSV = () => {
    const csvData = [];

    // Extract headers from the datasets
    const headers = ['Year', ...data.datasets.map(dataset => dataset.label)];

    // Add header
    csvData.push(headers);

    // Add data
    data.labels.forEach((label, index) => {
      const row = [label];
      data.datasets.forEach((dataset) => {
        row.push(dataset.data[index]);
      });
      csvData.push(row);
    });

    const csv = Papa.unparse(csvData);

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button onClick={downloadCSV} className="mt-4 p-2 bg-blue-500 text-white rounded">
      Download CSV
    </button>
  );
};

DownloadCSVButton.propTypes = {
  data: PropTypes.shape({
    labels: PropTypes.arrayOf(PropTypes.string).isRequired,
    datasets: PropTypes.arrayOf(
      PropTypes.shape({
        data: PropTypes.arrayOf(PropTypes.number).isRequired,
        label: PropTypes.string.isRequired,
      })
    ).isRequired,
  }).isRequired,
  filename: PropTypes.string.isRequired,
};

export default DownloadCSVButton;
