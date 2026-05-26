import React, { useState } from 'react';
import { Plus, Edit } from 'lucide-react';
import StudyPlanPopup from '../../../src/components/overview/studyplanui/studyplanpopup';

interface StudyPlan {
  id: number;
  plan_name: string;
  user_id: number;
  start_date: string;
  end_date: string;
  weekdays: string[];
  study_time: number;
}

interface StudyPlanFormProps {
  userId: number;
  editingPlan: StudyPlan | null;
  setEditingPlan: (plan: StudyPlan | null) => void;
  setSuccess: (message: string) => void;
  setError: (message: string) => void;
  onPlanUpdate: () => void;
}

const StudyPlanForm: React.FC<StudyPlanFormProps> = ({
  userId,
  editingPlan,
  setEditingPlan,
  setSuccess,
  setError,
  onPlanUpdate
}) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleCreatePlan = () => {
    setEditingPlan(null); // Ensure we're creating, not editing
    setIsPopupOpen(true);
  };

  const handleEditPlan = (plan: StudyPlan) => {
    setEditingPlan(plan);
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setEditingPlan(null);
  };

  return (
    <div>
      {/* Create Plan Button */}
      <div className="mb-6">
        <button
          onClick={handleCreatePlan}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Study Plan
        </button>
      </div>

      {/* Study Plan Popup */}
      <StudyPlanPopup
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
        userId={userId}
        editingPlan={editingPlan}
        setSuccess={setSuccess}
        setError={setError}
        onPlanUpdate={onPlanUpdate}
      />
    </div>
  );
};

export default StudyPlanForm;