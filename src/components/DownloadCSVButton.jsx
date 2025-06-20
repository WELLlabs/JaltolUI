// src/components/DownloadCSVButton.jsx
import Papa from 'papaparse';
import PropTypes from 'prop-types';

const DownloadCSVButton = ({ data, filename, disabled = false, isAuthenticated = true }) => {
  const downloadCSV = () => {
    if (!isAuthenticated) {
      return;
    }
    
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

  const isDisabled = disabled || !isAuthenticated;

  return (
    <div className="flex flex-col items-center">
      <button 
        onClick={downloadCSV} 
        disabled={isDisabled}
        className={`mt-4 p-2 rounded transition-all duration-200 ${
          isDisabled 
            ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
            : 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer'
        }`}
        title={!isAuthenticated ? "Login required to download CSV" : ""}
      >
        Download CSV
      </button>
      {!isAuthenticated && (
        <p className="text-xs text-gray-500 mt-1">Login required</p>
      )}
    </div>
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
  disabled: PropTypes.bool,
  isAuthenticated: PropTypes.bool,
};

export default DownloadCSVButton;
