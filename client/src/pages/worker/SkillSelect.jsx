import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import Layout from '../../components/Layout';
import Button from '../../components/Button';
import Input from '../../components/Input';
import ProgressBar from '../../components/ProgressBar';
import { Wrench, Zap, PaintBucket, Hammer, Truck, Shirt, ChefHat, Grid, Briefcase, House } from 'lucide-react';
import api from '../../api/axios';

const SERVICE_ICONS = {
    electrician: Zap,
    plumber: Wrench,
    painter: PaintBucket,
    carpenter: Hammer,
    driver: Truck,
    tailor: Shirt,
    cook: ChefHat,
    maid: House
};

const SkillSelect = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { t } = useLanguage();

    // Auto-fill from voice extraction if available
    const initialSkills = state?.profileData?.extractedSkill ? [state.profileData.extractedSkill] : [];
    const [selectedSkills, setSelectedSkills] = useState(initialSkills);
    const [otherSkillText, setOtherSkillText] = useState('');
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.get('/categories');
                if (res.data.success) {
                    setCategories(res.data.categories || []);
                }
            } catch (err) {
                console.error("Failed to fetch categories");
            }
        };
        fetchCategories();
    }, []);

    const toggleSkill = (id) => {
        if (selectedSkills.includes(id)) {
            setSelectedSkills(prev => prev.filter(s => s !== id));
        } else {
            setSelectedSkills(prev => [...prev, id]);
        }
    };

    const isNextDisabled = selectedSkills.length === 0 || (selectedSkills.includes('other') && !otherSkillText.trim());

    const handleNext = () => {
        const skillsToSave = selectedSkills.includes('other') ?
            [...selectedSkills.filter(s => s !== 'other'), otherSkillText] :
            selectedSkills;

        // We set the first skill as serviceType for simplicity, or we could pass the whole array
        const serviceType = skillsToSave.length > 0 ? skillsToSave[0] : '';

        navigate('/worker/location-confirm', {
            state: {
                profileData: {
                    ...state?.profileData,
                    skills: skillsToSave,
                    serviceType
                }
            }
        });
    };

    return (
        <Layout>
            <div className="max-w-md mx-auto py-8">
                <ProgressBar currentStep={2} totalSteps={4} />

                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">{t.workerProfile.skills.title}</h2>
                    <p className="text-gray-500">{t.workerProfile.skills.subtitle}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    {categories.map((category) => {
                        const isSelected = selectedSkills.includes(category.name);
                        const serviceName = category.name.toLowerCase();
                        const Icon = SERVICE_ICONS[serviceName] || Briefcase;
                        return (
                            <div
                                key={category._id}
                                onClick={() => toggleSkill(category.name)}
                                className={`
                  cursor-pointer p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all
                  ${isSelected ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 bg-white text-gray-600 hover:border-green-200'}
                `}
                            >
                                <Icon size={32} />
                                <span className="font-medium text-center">{category.name}</span>
                            </div>
                        );
                    })}

                    <div
                        onClick={() => toggleSkill('other')}
                        className={`
          cursor-pointer p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all
          ${selectedSkills.includes('other') ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 bg-white text-gray-600 hover:border-green-200'}
        `}
                    >
                        <Grid size={32} />
                        <span className="font-medium text-center">{t.workerProfile.skills.list.other}</span>
                    </div>
                </div>

                {selectedSkills.includes('other') && (
                    <div className="mb-8 animate-in fade-in slide-in-from-top-2">
                        <Input
                            placeholder={t.workerProfile.skills.otherPlaceholder}
                            value={otherSkillText}
                            onChange={(e) => setOtherSkillText(e.target.value)}
                            className="bg-white border-green-200"
                        />
                    </div>
                )}

                <Button
                    onClick={handleNext}
                    variant="primary"
                    className="w-full"
                    disabled={isNextDisabled}
                >
                    {t.workerProfile.skills.next}
                </Button>
            </div>
        </Layout>
    );
};

export default SkillSelect;
