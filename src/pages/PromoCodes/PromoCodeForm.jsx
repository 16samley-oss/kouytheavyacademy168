// src/pages/PromoCodes/PromoCodeForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import promoCodeService from '../../services/promoCodeService';
import courseService from '../../services/courseService';

const PromoCodeForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    max_uses: 1,
    valid_from: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    valid_until: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"),
    minimum_purchase: 0,
    is_active: true,
    course_ids: []
  });

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(isEditMode);
  const [selectedCourses, setSelectedCourses] = useState([]);

  useEffect(() => {
    fetchCourses();
    if (isEditMode) {
      fetchPromoCode();
    }
  }, [id]);

  const fetchCourses = async () => {
    try {
      const data = await courseService.getAllCoursesAdmin();
      setCourses(data);
    } catch (error) {
      toast.error('Failed to fetch courses');
    }
  };

  const fetchPromoCode = async () => {
    try {
      setFetchingData(true);
      const data = await promoCodeService.getPromoCodeById(id);
      
      // Format dates for input fields
      setFormData({
        ...data,
        valid_from: format(new Date(data.valid_from), "yyyy-MM-dd'T'HH:mm"),
        valid_until: format(new Date(data.valid_until), "yyyy-MM-dd'T'HH:mm")
      });
      
      setSelectedCourses(data.courses?.map(c => c.id) || []);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch promo code');
      navigate('/promocodes');
    } finally {
      setFetchingData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCourseToggle = (courseId) => {
    setSelectedCourses(prev => {
      if (prev.includes(courseId)) {
        return prev.filter(id => id !== courseId);
      } else {
        return [...prev, courseId];
      }
    });
  };

  const handleSelectAllCourses = () => {
    if (selectedCourses.length === courses.length) {
      setSelectedCourses([]);
    } else {
      setSelectedCourses(courses.map(c => c.id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.code.trim()) {
      toast.error('Promo code is required');
      return;
    }
    
    if (!formData.discount_value || formData.discount_value <= 0) {
      toast.error('Discount value must be greater than 0');
      return;
    }
    
    const validFrom = new Date(formData.valid_from);
    const validUntil = new Date(formData.valid_until);
    
    if (validFrom >= validUntil) {
      toast.error('Valid until date must be after valid from date');
      return;
    }
    
    try {
      setLoading(true);
      
      const promoData = {
        ...formData,
        discount_value: parseFloat(formData.discount_value),
        max_uses: parseInt(formData.max_uses),
        minimum_purchase: parseFloat(formData.minimum_purchase),
        course_ids: selectedCourses
      };
      
      if (isEditMode) {
        await promoCodeService.updatePromoCode(id, promoData);
        toast.success('Promo code updated successfully');
      } else {
        await promoCodeService.createPromoCode(promoData);
        toast.success('Promo code created successfully');
      }
      
      navigate('/promocodes');
    } catch (error) {
      toast.error(error.message || `Failed to ${isEditMode ? 'update' : 'create'} promo code`);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Loading promo code...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">
        {isEditMode ? 'Edit Promo Code' : 'Create New Promo Code'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Promo Code *
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., SUMMER2024"
                maxLength="50"
              />
              <p className="mt-1 text-xs text-gray-500">
                Code will be stored in uppercase
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Brief description of this promo"
              />
            </div>

            {/* Discount Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Type *
              </label>
              <select
                name="discount_type"
                value={formData.discount_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>

            {/* Discount Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Value *
              </label>
              <div className="relative">
                {formData.discount_type === 'fixed' && (
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                )}
                <input
                  type="number"
                  name="discount_value"
                  value={formData.discount_value}
                  onChange={handleChange}
                  required
                  min="0.01"
                  step="0.01"
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    formData.discount_type === 'fixed' ? 'pl-7' : ''
                  }`}
                  placeholder={formData.discount_type === 'percentage' ? '10' : '10.00'}
                />
                {formData.discount_type === 'percentage' && (
                  <span className="absolute right-3 top-2 text-gray-500">%</span>
                )}
              </div>
            </div>

            {/* Max Uses */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Uses *
              </label>
              <input
                type="number"
                name="max_uses"
                value={formData.max_uses}
                onChange={handleChange}
                required
                min="1"
                step="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Minimum Purchase */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Purchase ($)
              </label>
              <input
                type="number"
                name="minimum_purchase"
                value={formData.minimum_purchase}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">0 = no minimum</p>
            </div>

            {/* Valid From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valid From *
              </label>
              <input
                type="datetime-local"
                name="valid_from"
                value={formData.valid_from}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Valid Until */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valid Until *
              </label>
              <input
                type="datetime-local"
                name="valid_until"
                value={formData.valid_until}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                id="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                Active (promo code can be used)
              </label>
            </div>
          </div>
        </div>

        {/* Course Selection */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Applicable Courses</h2>
          <p className="text-sm text-gray-600 mb-4">
            Select specific courses this promo code applies to. Leave empty to apply to all courses.
          </p>

          <div className="mb-4 flex items-center space-x-4">
            <button
              type="button"
              onClick={handleSelectAllCourses}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              {selectedCourses.length === courses.length ? 'Deselect All' : 'Select All'}
            </button>
            <span className="text-sm text-gray-600">
              {selectedCourses.length} course{selectedCourses.length !== 1 ? 's' : ''} selected
            </span>
          </div>

          {courses.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No courses available</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto p-2">
              {courses.map(course => (
                <label
                  key={course.id}
                  className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedCourses.includes(course.id)}
                    onChange={() => handleCourseToggle(course.id)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{course.title}</p>
                    <p className="text-xs text-gray-500">
                      ${course.price} • {course.course_type}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/promocodes')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading && <i className="fas fa-spinner fa-spin mr-2"></i>}
            {isEditMode ? 'Update Promo Code' : 'Create Promo Code'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PromoCodeForm;