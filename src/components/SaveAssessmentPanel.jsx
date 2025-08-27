import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { useAuth } from '../context/AuthContext';
import SaveProjectModal from './SaveProjectModal';
import {
  selectedStateAtom,
  selectedDistrictAtom,
  selectedSubdistrictAtom,
  selectedVillageAtom,
  selectedControlVillageAtom,
} from '../recoil/selectAtoms';
import { saveProjectFromAssessment } from '../services/api';

const SaveAssessmentPanel = () => {
  const { isAuthenticated } = useAuth();
  const selectedState = useRecoilValue(selectedStateAtom);
  const selectedDistrict = useRecoilValue(selectedDistrictAtom);
  const selectedSubdistrict = useRecoilValue(selectedSubdistrictAtom);
  const selectedVillage = useRecoilValue(selectedVillageAtom);
  const selectedControlVillage = useRecoilValue(selectedControlVillageAtom);

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const parseIntOrNull = (val) => {
    if (!val && val !== 0) return null;
    const n = parseInt(val);
    return Number.isNaN(n) ? null : n;
  };

  const currentProjectData = () => ({
    state: selectedState?.label || selectedState,
    district: selectedDistrict?.label || '',
    subdistrict: selectedSubdistrict?.label || '',
    village: selectedVillage?.villageName || selectedVillage?.label || '',
    village_id: parseIntOrNull(selectedVillage?.villageId),
    control_state: selectedState?.label || selectedState,
    control_district: selectedDistrict?.label || '',
    control_subdistrict: selectedSubdistrict?.label || '',
    control_village: selectedControlVillage?.villageName || selectedControlVillage?.label || '',
    control_village_id: parseIntOrNull(selectedControlVillage?.villageId),
    intervention_start_year: null,
    intervention_end_year: null,
  });

  const handleSave = async (projectData) => {
    try {
      setSaving(true);
      setError(null);
      const payload = {
        ...projectData,
        state: selectedState?.label || selectedState,
        district: selectedDistrict?.label || '',
        subdistrict: selectedSubdistrict?.label || '',
        village: selectedVillage?.villageName || selectedVillage?.label || '',
        village_id: parseIntOrNull(selectedVillage?.villageId),
        control_state: selectedState?.label || selectedState,
        control_district: selectedDistrict?.label || '',
        control_subdistrict: selectedSubdistrict?.label || '',
        control_village: selectedControlVillage?.villageName || selectedControlVillage?.label || '',
        control_village_id: parseIntOrNull(selectedControlVillage?.villageId),
        project_type: 'village',
      };
      const res = await saveProjectFromAssessment(payload);
      if (!res.success) throw new Error(res.message || 'Failed to save project');
      return res;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-3 rounded-lg border border-green-200 bg-green-50">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-green-800 m-0 leading-none">{selectedVillage ? 'Save this Village view' : 'Select a Village to Save'}</h3>
        </div>
        <button
          onClick={() => setOpen(true)}
          disabled={!selectedVillage || !isAuthenticated}
          className={`${selectedVillage && isAuthenticated ? 'bg-green-600 hover:bg-green-700 cursor-pointer' : 'bg-gray-400 cursor-not-allowed'} text-white px-2 py-2 rounded-md flex items-center gap-2`}
        >
          Save
        </button>
      </div>
      <SaveProjectModal
        isOpen={open}
        onClose={() => { setOpen(false); setError(null); }}
        onSave={handleSave}
        projectData={currentProjectData()}
        isLoading={saving}
        mapRefs={{}}
        selectedVillage={selectedVillage}
        compareMode={false}
      />
      {/* Auxiliary texts removed per design request */}
    </div>
  );
};

export default SaveAssessmentPanel;


