import React from "react";
import TextInput from ".//TextInput";

export interface LocationDetailData {
  locationLabel: string;
  townOrcity: string;
  addressLine1: string;
  addressLine2: string;
  county: string;
  postcode: string;
}

interface LocationDetailProps {
  data: LocationDetailData;
  onChange: (field: keyof LocationDetailData, value: string) => void;
  editMode?: boolean;
}

const LocationDetail: React.FC<LocationDetailProps> = ({
  data,
  onChange,
  editMode = false,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <TextInput
        label="Location label"
        value={data.locationLabel}
        onChange={(value) => onChange("locationLabel", value)}
        placeholder="e.g. Main Office"
        name="locationLabel"
        required
        disabled={false} // Always editable
      />
      <TextInput
        label="Town/City"
        value={data.townCity}
        onChange={(value) => onChange("townCity", value)}
        placeholder="e.g. London"
        name="townCity"
        required
        disabled={editMode} // Disabled in edit mode
      />
      <TextInput
        label="Address line 1"
        value={data.addressLine1}
        onChange={(value) => onChange("addressLine1", value)}
        placeholder="e.g. 123 High Street"
        name="addressLine1"
        required
        disabled={editMode} // Disabled in edit mode
      />
      <TextInput
        label="Address line 2"
        value={data.addressLine2}
        onChange={(value) => onChange("addressLine2", value)}
        placeholder="Optional"
        name="addressLine2"
        disabled={editMode} // Disabled in edit mode
      />
      <TextInput
        label="County"
        value={data.county}
        onChange={(value) => onChange("county", value)}
        placeholder="e.g. Greater London"
        name="county"
        required
        disabled={editMode} // Disabled in edit mode
      />
      <TextInput
        label="Postcode"
        value={data.postcode}
        onChange={(value) => onChange("postcode", value)}
        placeholder="e.g. SW1A 1AA"
        name="postcode"
        required
        disabled={editMode} // Disabled in edit mode
      />
    </div>
  );
};

export default LocationDetail;
