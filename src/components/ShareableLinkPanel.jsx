import ShareableLink from './ShareableLink';
import { useRecoilValue } from 'recoil';
import {
  selectedStateAtom,
  selectedDistrictAtom,
  selectedSubdistrictAtom,
  selectedVillageAtom,
} from '../recoil/selectAtoms';

const ShareableLinkPanel = ({ minimal = false, onClose }) => {
  const selectedState = useRecoilValue(selectedStateAtom);
  const selectedDistrict = useRecoilValue(selectedDistrictAtom);
  const selectedSubdistrict = useRecoilValue(selectedSubdistrictAtom);
  const selectedVillage = useRecoilValue(selectedVillageAtom);

  return (
    <div>
      {onClose ? (
        <div className="flex items-center justify-between mb-1 bg-gray-100 px-2 rounded-md">
          <h3 className="text-sm font-medium text-gray-800">Copy Link</h3>
          <button
            type="button"
            aria-label="Close share panel"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-600 bg-gray-100 hover:bg-gray-100"
            onClick={onClose}
          >
            <span className="text-xl leading-none">×</span>
          </button>
        </div>
      ) : null}
      <ShareableLink
        state={selectedState?.label || selectedState}
        district={selectedDistrict}
        subdistrict={selectedSubdistrict}
        village={selectedVillage}
        minimal={minimal}
      />
    </div>
  );
};

export default ShareableLinkPanel;


