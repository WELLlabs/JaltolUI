import LocationSelectors from '../components/LocationSelectors';
import ShareableLinkPanel from '../components/ShareableLinkPanel';
import SaveAssessmentPanel from '../components/SaveAssessmentPanel';
import IconButtonShare from '../components/IconButtonShare';
import IconButtonSave from '../components/IconButtonSave';
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue, useRecoilState, useSetRecoilState } from 'recoil';
import Select from 'react-select';
import { isBhuvanLulcState } from '../constants';
import {
  selectedVillageAtom,
} from '../recoil/selectAtoms';
import Modal from '../components/Modal';
import { useLocationSelectors } from '../hooks/useLocationSelectors';
import { saveProjectFromAssessment } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LandCoverChangeChartSkeleton from '../components/LandCoverChangeChartSkeleton';
import LandCoverChangeChart from '../components/LandCoverChangeChart';
import VillageMap from '../components/VillageMap';
import { landCoverChartDataAtom, interventionStartYearAtom, interventionEndYearAtom } from '../recoil/selectAtoms';

// Skeleton page for the Impact Assessment revamp (V2)
// No routing changes yet. Pure layout scaffolding for iterative work.

const ImpactAssessmentV2 = () => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareWarning, setShareWarning] = useState('');
  const [saveWarning, setSaveWarning] = useState('');
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [currentLoadingVillage, setCurrentLoadingVillage] = useState(null);
  const selectedVillage = useRecoilValue(selectedVillageAtom);
  const [showLulc, setShowLulc] = useState(true);
  const [lulcOpacity, setLulcOpacity] = useState(1.0);
  const [selectedLulcYear, setSelectedLulcYear] = useState('2023');
  const [isYearLoading, setIsYearLoading] = useState(false);
  const districtMapRef = useRef(null);
  const scrollRef = useRef(null);
  const chartData = useRecoilValue(landCoverChartDataAtom);
  const [interventionStartYear, setInterventionStartYear] = useRecoilState(interventionStartYearAtom);
  const [interventionEndYear, setInterventionEndYear] = useRecoilState(interventionEndYearAtom);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  // Callback to handle selection changes and clear chart loading if needed
  const handleSelectionChange = (level, option) => {
    if (isChartLoading) {
      setIsChartLoading(false);
      setCurrentLoadingVillage(null);
    }
  };

  const {
    selectedState,
    selectedDistrict,
    selectedSubdistrict,
    selectedVillage: selectedVillageFromHook,
    stateOptions,
    districtOptions,
    subdistrictOptions,
    villageOptions,
    handleStateChange,
    handleDistrictChange,
    handleSubdistrictChange,
    handleVillageChange,
  } = useLocationSelectors(handleSelectionChange);



  // LULC year options based on selected state
  const getLulcYearOptions = () => {
    const stateName = selectedState?.label || selectedState;
    if (isBhuvanLulcState(stateName)) {
      const years = [];
      for (let year = 2024; year >= 2005; year--) {
        if (year !== 2019 && year !== 2024) years.push({ value: String(year), label: String(year) });
      }
      return years;
    }
    return [
      { value: '2023', label: '2023' },
      { value: '2022', label: '2022' },
      { value: '2021', label: '2021' },
      { value: '2020', label: '2020' },
      { value: '2019', label: '2019' },
      { value: '2018', label: '2018' },
      { value: '2017', label: '2017' },
    ];
  };
  const [lulcYearOptions, setLulcYearOptions] = useState([]);
  useEffect(() => {
    if (!selectedState) return;
    const opts = getLulcYearOptions();
    setLulcYearOptions(opts);
    if (opts.length > 0 && !opts.find(o => o.value === selectedLulcYear)) {
      setSelectedLulcYear(opts[0].value);
    }
  }, [selectedState]);

  const generateProjectName = () => {
    const parts = [
      selectedState?.label || selectedState || '',
      selectedDistrict?.label || '',
      selectedSubdistrict?.label || '',
      selectedVillageFromHook?.villageName || selectedVillageFromHook?.label || ''
    ].filter(Boolean);
    const base = parts.join(' / ');
    const ts = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    return base ? `${base} – ${ts}` : `Jaltol Project – ${ts}`;
  };

  // Hydrate selectors from URL params on first load
  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams(window.location.search);
    const stateParam = (params.get('state') || '').trim();
    const districtParam = (params.get('district') || '').trim();
    const subdistrictParam = (params.get('subdistrict') || '').trim();
    const villageParam = (params.get('village') || '').trim();

    if (!stateParam) return;

    const sleep = (ms) => new Promise(res => setTimeout(res, ms));
    const waitFor = async (fn, timeoutMs = 8000) => {
      const start = Date.now();
      // eslint-disable-next-line no-constant-condition
      while (!fn()) {
        if (Date.now() - start > timeoutMs) return false;
        await sleep(50);
      }
      return true;
    };

    (async () => {
      console.log('[V2 Hydration] Starting with params', { stateParam, districtParam, subdistrictParam, villageParam });
      // 1) State
      await waitFor(() => stateOptions && stateOptions.length > 0);
      if (cancelled) return;
      const stateOption = stateOptions.find(s =>
        s.label?.toLowerCase().trim() === stateParam.toLowerCase() ||
        s.name?.toLowerCase().trim() === stateParam.toLowerCase()
      );
      if (!stateOption) { console.warn('[V2 Hydration] State not found', { stateParam, available: stateOptions.map(s=>s.label) }); return; }
      if (!selectedState || selectedState.value !== stateOption.value) {
        console.log('[V2 Hydration] Setting state', stateOption);
        handleStateChange(stateOption);
      }

      // 2) District
      await waitFor(() => districtOptions && districtOptions.length > 0);
      if (cancelled) return;
      console.log('[V2 Hydration] District options ready', districtOptions.length);
      let districtOption = null;
      if (districtParam) {
        districtOption = districtOptions.find(d =>
          d.label?.toLowerCase().trim() === districtParam.toLowerCase() ||
          d.name?.toLowerCase().trim() === districtParam.toLowerCase()
        );
        if (!districtOption && districtParam.includes(',')) {
          const base = districtParam.split(',')[0].trim();
          districtOption = districtOptions.find(d =>
            d.label?.toLowerCase().trim() === base.toLowerCase() ||
            d.name?.toLowerCase().trim() === base.toLowerCase()
          );
        }
      }
      if (districtOption && (!selectedDistrict || selectedDistrict.value !== districtOption.value)) {
        console.log('[V2 Hydration] Setting district', districtOption);
        handleDistrictChange(districtOption);
      }

      // 3) Subdistrict
      await waitFor(() => subdistrictOptions && subdistrictOptions.length > 0);
      if (cancelled) return;
      console.log('[V2 Hydration] Subdistrict options ready', subdistrictOptions.length);
      let subdistrictOption = null;
      if (subdistrictParam) {
        subdistrictOption = subdistrictOptions.find(s =>
          s.label?.toLowerCase().trim() === subdistrictParam.toLowerCase() ||
          s.name?.toLowerCase().trim() === subdistrictParam.toLowerCase()
        );
      }
      if (subdistrictOption && (!selectedSubdistrict || selectedSubdistrict.value !== subdistrictOption.value)) {
        console.log('[V2 Hydration] Setting subdistrict', subdistrictOption);
        handleSubdistrictChange(subdistrictOption);
      }

      // 4) Village
      await waitFor(() => villageOptions && villageOptions.length > 0);
      if (cancelled) return;
      console.log('[V2 Hydration] Village options ready', villageOptions.length);
      let villageOption = null;
      if (villageParam) {
        villageOption = villageOptions.find(v =>
          v.label?.toLowerCase().trim() === villageParam.toLowerCase() ||
          v.villageName?.toLowerCase().trim() === villageParam.toLowerCase()
        );
      }
      if (villageOption) {
        console.log('[V2 Hydration] Setting village', villageOption);
        handleVillageChange(villageOption);
      }
    })();

    return () => { cancelled = true; };
  // We intentionally depend on the option arrays to step through as they load
  }, [stateOptions, districtOptions, subdistrictOptions, villageOptions]);
  
  // Reset intervention period when chart data scope changes
  useEffect(() => {
    setInterventionStartYear(null);
    setInterventionEndYear(null);
  }, [chartData?.labels, setInterventionStartYear, setInterventionEndYear]);

  // Track chart loading state and handle village selection changes
  useEffect(() => {
    if (selectedVillage && selectedVillage.label) {
      // New village selected - start loading
      setIsChartLoading(true);
      setCurrentLoadingVillage(selectedVillage.label);
    } else {
      // Village cleared - reset loading state
      setIsChartLoading(false);
      setCurrentLoadingVillage(null);
    }
  }, [selectedVillage]);

  // Clear chart loading state when chart data arrives
  useEffect(() => {
    if (chartData && chartData.labels && chartData.labels.length > 0) {
      setIsChartLoading(false);
      setCurrentLoadingVillage(null);
    }
  }, [chartData]);

  const availableYears = (chartData?.labels || []).map((y) => ({ value: String(y), label: String(y) }));
  const endYearOptions = interventionStartYear
    ? availableYears.filter((y) => parseInt(y.value) > parseInt(interventionStartYear.value))
    : availableYears;
  return (
    <div className="bg-surface text-gray-800 min-h-screen">
        {/* Pre-compare desktop: 2 columns; mobile: 1 column */}
        <section className="mx-auto w-[95%] py-3 md:py-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Q1: Left column placeholder */}
          <div className="bg-white rounded-lg shadow-sm p-4 md:p-4 min-h-[420px] border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-semibold">Impact Assessment</h1>
              <div className="flex items-center gap-2">
                <IconButtonShare onClick={() => {
                  if (!selectedVillage || !selectedVillage.label) {
                    setShareWarning('Please Select a Village to Share');
                    setIsShareModalOpen(false);
                    return;
                  }
                  setShareWarning('');
                  setIsShareModalOpen(true);
                }} />
                <IconButtonSave onClick={async () => {
                  // Clear prior warning
                  setSaveWarning('');
                  // Check village selected
                  const villageSelected = selectedVillageFromHook && selectedVillageFromHook.label;
                  if (!villageSelected) {
                    setSaveWarning('Please Select a Village to Save');
                    return;
                  }

                  // Build payload similar to SaveAssessmentPanel
                  const parseIntOrNull = (val) => {
                    if (!val && val !== 0) return null;
                    const n = parseInt(val);
                    return Number.isNaN(n) ? null : n;
                  };
                  const payload = {
                    name: generateProjectName(),
                    state: selectedState?.label || selectedState,
                    district: selectedDistrict?.label || '',
                    subdistrict: selectedSubdistrict?.label || '',
                    village: selectedVillageFromHook?.villageName || selectedVillageFromHook?.label || '',
                    village_id: parseIntOrNull(selectedVillageFromHook?.villageId),
                    control_state: selectedState?.label || selectedState,
                    control_district: selectedDistrict?.label || '',
                    control_subdistrict: selectedSubdistrict?.label || '',
                    control_village: '',
                    control_village_id: null,
                    project_type: 'village',
                    intervention_start_year: null,
                    intervention_end_year: null,
                  };

                  if (!isAuthenticated) {
                    // Stash for post-auth save and redirect to register
                    console.log('[V2 Save] Not authenticated. Stashing payload and redirecting to register', payload);
                    localStorage.setItem('pendingSaveVillage', JSON.stringify(payload));
                    localStorage.setItem('postAuthRedirect', '/my-projects');
                    navigate('/register?redirect=/my-projects');
                    return;
                  }

                  try {
                    console.log('[V2 Save] Authenticated. Saving payload now...', payload);
                    const res = await saveProjectFromAssessment(payload);
                    if (res && res.success) {
                      console.log('[V2 Save] Save successful, navigating to /my-projects');
                      navigate('/my-projects');
                    } else {
                      console.warn('[V2 Save] Save failed response', res);
                      setSaveWarning(res?.message || 'Failed to save project');
                    }
                  } catch (e) {
                    console.error('[V2 Save] Save threw error', e);
                    setSaveWarning(e.message || 'Failed to save project');
                  }
                }} />
              </div>
            </div>
            <p className="text-gray-600">Select a village to view historical Cropping Intensity and Tree Cover</p>     
            {shareWarning ? (
              <div className="mt-2 text-sm text-red-600">{shareWarning}</div>
            ) : null}
            {saveWarning ? (
              <div className="mt-2 text-sm text-red-600">{saveWarning}</div>
            ) : null}
            <div className="mt-4">
              {/* Q1 Location selectors (shared atoms ensure sync with Q3 later) */}
              <LocationSelectors />
            </div>
            {/* Intervention Period Selection */}
            {selectedVillage && selectedVillage.label && (
              <div className="mt-4 flex items-center gap-3 flex-wrap border border-gray-200 rounded-md p-2">
                <span className="font-medium text-gray-800 whitespace-nowrap">Intervention:</span>
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={interventionStartYear?.value || ''}
                  onChange={(e) => {
                    const yr = e.target.value ? { value: e.target.value, label: e.target.value } : null;
                    setInterventionStartYear(yr);
                    if (yr && interventionEndYear && parseInt(interventionEndYear.value) <= parseInt(yr.value)) {
                      setInterventionEndYear(null);
                    }
                  }}
                >
                  <option value="">Start year</option>
                  {availableYears.map((y) => (
                    <option key={y.value} value={y.value}>{y.label}</option>
                  ))}
                </select>
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={interventionEndYear?.value || ''}
                  onChange={(e) => setInterventionEndYear(e.target.value ? { value: e.target.value, label: e.target.value } : null)}
                  disabled={!interventionStartYear}
                >
                  <option value="">End year</option>
                  {endYearOptions.map((y) => (
                    <option key={y.value} value={y.value}>{y.label}</option>
                  ))}
                </select>
              </div>
            )}

            {/* LandCoverChangeChart placeholder or chart */}
            <div className="mt-4">
              {selectedVillage && selectedVillage.label ? (
                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Village: {selectedVillage?.label || 'None selected'}
                    </h3>
                    {isChartLoading && (
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                        Loading chart data...
                      </div>
                    )}
                  </div>
                                    <div className="relative w-full h-[40vh]">
                    <LandCoverChangeChart
                      interventionStartYear={interventionStartYear?.value}
                      interventionEndYear={interventionEndYear?.value}
                    />
                  </div>
                </div>
              ) : (
                <LandCoverChangeChartSkeleton animated />
              )}
            </div>
          </div>

          {/* Q2: Right column - Village Map */}
          <div className="bg-blue-50 rounded-lg p-3 min-h-[420px] flex flex-col">
            {/* Tab-like interface */}
            <div className="flex mb-3 bg-white rounded-lg p-1 shadow-sm">
              <div className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium">
                Treatment Village
              </div>
              <button
                onClick={() => {
                  if (isAuthenticated) {
                    // Trigger compare villages functionality
                    console.log('Control Village clicked');
                  }
                }}
                disabled={!isAuthenticated}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  isAuthenticated
                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                title={!isAuthenticated ? "Coming soon, sign up to be the first to hear about it" : ""}
              >
                Control Village
              </button>
            </div>

            {/* Village Map */}
            <div className="flex-1">
              <VillageMap
                selectedState={selectedState?.label || selectedState}
                selectedDistrict={selectedDistrict}
                selectedSubdistrict={selectedSubdistrict}
                selectedVillage={selectedVillage}
                scrollRef={scrollRef}
                villageMapRef={districtMapRef}
                isAuthenticated={isAuthenticated}
                showLulc={showLulc}
                lulcOpacity={lulcOpacity}
                selectedLulcYear={selectedLulcYear}
                onYearLoadingChange={setIsYearLoading}
              />
            </div>

            {/* Map Controls - Below the map */}
          <div className="space-y-2">
              {/* Legend */}
              <div className="bg-white px-3 py-2 mt-2 rounded-lg shadow-sm w-full">
                <div className="text-sm font-semibold mb-1">Legend:</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2">
                  <div className="inline-flex items-center gap-1 whitespace-nowrap">
                    <div className="w-3 h-3 bg-green-600 rounded"></div>
                    <span className="text-xs">Tree Cover</span>
                  </div>
                  <div className="inline-flex items-center gap-1 whitespace-nowrap">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span className="text-xs">Single Crop</span>
                  </div>
                  <div className="inline-flex items-center gap-1 whitespace-nowrap">
                    <div className="w-3 h-3 bg-blue-900 rounded"></div>
                    <span className="text-xs">Double Crop</span>
                  </div>
                  <div className="inline-flex items-center gap-1 whitespace-nowrap">
                    <div className="w-3 h-3 bg-yellow-600 rounded"></div>
                    <span className="text-xs">Shrubs</span>
                  </div>
                </div>
              </div>
            
              {/* Combined Controls Row: LULC Toggle + Year + Opacity + Buttons */}
              <div className="flex flex-wrap items-center gap-2 w-full">
                <div className="inline-flex flex-wrap items-center gap-2 bg-white p-2 rounded-lg flex-none">
                  <button
                    onClick={() => setShowLulc(!showLulc)}
                    className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                      showLulc ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                    }`}
                  >
                    LULC {showLulc ? 'ON' : 'OFF'}
                  </button>
                  <label className="text-xs text-gray-700 whitespace-nowrap">Year:</label>
                  <div className="flex items-center gap-1">
                  <div className="w-20">
                    <Select
                      options={lulcYearOptions}
                        value={lulcYearOptions.find(o => o.value === selectedLulcYear) || null}
                        onChange={(opt) => opt && setSelectedLulcYear(opt.value)}
                      menuPlacement="top"
                      isSearchable={false}
                      placeholder="Year"
                        menuPortalTarget={document.body}
                        isDisabled={isYearLoading}
                      styles={{
                          control: (base) => ({ ...base, minHeight: '28px', fontSize: '12px', borderRadius: '4px' }),
                          option: (base, { isFocused, isSelected }) => ({
                            ...base,
                          fontSize: '12px',
                          backgroundColor: isSelected ? '#3b82f6' : isFocused ? '#eff6ff' : 'white',
                          color: isSelected ? 'white' : 'black',
                        }),
                        singleValue: (base) => ({ ...base, fontSize: '12px', color: '#374151' }),
                        dropdownIndicator: (base) => ({ ...base, padding: '2px' }),
                        menu: (base) => ({ ...base, fontSize: '12px', zIndex: 9999 }),
                        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                      }}
                    />
                  </div>
                    {isYearLoading && (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-700 whitespace-nowrap">Opacity:</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={lulcOpacity}
                    onChange={(e) => setLulcOpacity(parseFloat(e.target.value))}
                      className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                    <span className="text-xs text-gray-600 w-10 text-right">{Math.round(lulcOpacity * 100)}%</span>
                  </div>
                </div>

                <button
                  disabled={!selectedVillage || !isAuthenticated}
                  className={`px-2 py-2 h-9 rounded-lg font-medium transition-all duration-200 text-xs ${
                    selectedVillage && isAuthenticated
                      ? 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer'
                      : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  }`}
                  title={!isAuthenticated ? "Coming soon, sign up to be the first to hear about it" : ""}
                >
                  Download Map
                </button>
              </div>
            </div>
          </div>
        </section>
        <Modal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} frameless>
          <ShareableLinkPanel minimal onClose={() => setIsShareModalOpen(false)} />
        </Modal>
      </div>
  );
};

export default ImpactAssessmentV2;


