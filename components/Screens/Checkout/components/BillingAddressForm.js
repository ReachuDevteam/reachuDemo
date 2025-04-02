import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    ScrollView,
    Alert,
} from 'react-native';
import { Button } from '@rneui/themed';
import { useCart } from '../../../../context/cartContext';

export const BillingAddressForm = ({
    onBack,
    onSubmit,
    initialValues,
}) => {
    const {
        state: { selectedCountry },
    } = useCart();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [phoneCode, setPhoneCode] = useState('+47');
    const [address1, setAddress1] = useState('');
    const [address2, setAddress2] = useState('');
    const [city, setCity] = useState('');
    const [country, setCountry] = useState('Norway');
    const [countryCode, setCountryCode] = useState(selectedCountry || 'NO');
    const [zipCode, setZipCode] = useState('');
    const [company, setCompany] = useState('');
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (initialValues) {
            console.log('Loading initial values for billing form:', initialValues);
            setFirstName(initialValues.first_name || '');
            setLastName(initialValues.last_name || '');
            setPhone(initialValues.phone || '');
            setPhoneCode(initialValues.phone_code || '+47');
            setAddress1(initialValues.address1 || '');
            setAddress2(initialValues.address2 || '');
            setCity(initialValues.city || '');
            setCountry(initialValues.country || 'Norway');
            setCountryCode(initialValues.country_code || selectedCountry || 'NO');
            setZipCode(initialValues.zip || '');
            setCompany(initialValues.company || '');
        }
    }, [initialValues, selectedCountry]);

    const validateForm = () => {
        let isValid = true;
        let newErrors = {};

        if (!firstName) {
            newErrors.firstName = 'First name is required';
            isValid = false;
        }

        if (!lastName) {
            newErrors.lastName = 'Last name is required';
            isValid = false;
        }

        if (!phone) {
            newErrors.phone = 'Phone number is required';
            isValid = false;
        }

        if (!address1) {
            newErrors.address1 = 'Address line 1 is required';
            isValid = false;
        }

        if (!city) {
            newErrors.city = 'City is required';
            isValid = false;
        }

        if (!zipCode) {
            newErrors.zipCode = 'Zip/Postal code is required';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = () => {
        console.log('Billing form submitting...');
        setIsSubmitting(true);

        if (validateForm()) {
            const formData = {
                first_name: firstName,
                last_name: lastName,
                phone,
                phone_code: phoneCode,
                address1,
                address2,
                city,
                country,
                country_code: countryCode.toUpperCase(),
                zip: zipCode,
                company,
                province: city,
                province_code: '',
            };

            console.log('Billing form validated, data:', formData);
            try {
                onSubmit(formData);
            } catch (error) {
                console.error('Error submitting billing form:', error);
                Alert.alert('Error', 'There was a problem submitting your billing information. Please try again.');
            } finally {
                setIsSubmitting(false);
            }
        } else {
            console.log('Billing form validation failed');
            setIsSubmitting(false);
        }
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Billing Address</Text>

            <View style={styles.formGroup}>
                <Text style={styles.label}>First Name *</Text>
                <TextInput
                    style={[styles.input, errors.firstName && styles.inputError]}
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="John"
                />
                {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Last Name *</Text>
                <TextInput
                    style={[styles.input, errors.lastName && styles.inputError]}
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Doe"
                />
                {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Phone *</Text>
                <View style={styles.phoneContainer}>
                    <TextInput
                        style={styles.phoneCodeInput}
                        value={phoneCode}
                        onChangeText={setPhoneCode}
                        placeholder="+47"
                        keyboardType="phone-pad"
                    />
                    <TextInput
                        style={[styles.phoneInput, errors.phone && styles.inputError]}
                        value={phone}
                        onChangeText={setPhone}
                        placeholder="123456789"
                        keyboardType="phone-pad"
                    />
                </View>
                {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Company (Optional)</Text>
                <TextInput
                    style={styles.input}
                    value={company}
                    onChangeText={setCompany}
                    placeholder="Company Name"
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Address Line 1 *</Text>
                <TextInput
                    style={[styles.input, errors.address1 && styles.inputError]}
                    value={address1}
                    onChangeText={setAddress1}
                    placeholder="123 Main St"
                />
                {errors.address1 && <Text style={styles.errorText}>{errors.address1}</Text>}
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Address Line 2 (Optional)</Text>
                <TextInput
                    style={styles.input}
                    value={address2}
                    onChangeText={setAddress2}
                    placeholder="Apartment, suite, etc."
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>City *</Text>
                <TextInput
                    style={[styles.input, errors.city && styles.inputError]}
                    value={city}
                    onChangeText={setCity}
                    placeholder="City"
                />
                {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Country *</Text>
                <TextInput
                    style={styles.input}
                    value={country}
                    onChangeText={setCountry}
                    placeholder="Norway"
                    editable={false}
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>ZIP/Postal Code *</Text>
                <TextInput
                    style={[styles.input, errors.zipCode && styles.inputError]}
                    value={zipCode}
                    onChangeText={setZipCode}
                    placeholder="12345"
                    keyboardType="numeric"
                />
                {errors.zipCode && <Text style={styles.errorText}>{errors.zipCode}</Text>}
            </View>

            <View style={styles.buttonContainer}>
                <Button
                    title="Back"
                    onPress={onBack}
                    buttonStyle={styles.backButton}
                    titleStyle={styles.backButtonText}
                    type="outline"
                    disabled={isSubmitting}
                />
                <Button
                    title={isSubmitting ? "Processing..." : "Continue"}
                    onPress={handleSubmit}
                    buttonStyle={styles.continueButton}
                    titleStyle={styles.continueButtonText}
                    disabled={isSubmitting}
                    loading={isSubmitting}
                />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
        color: '#000000',
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        color: '#333333',
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderColor: '#DDDDDD',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
    },
    inputError: {
        borderColor: '#FF3B30',
    },
    errorText: {
        color: '#FF3B30',
        fontSize: 14,
        marginTop: 5,
    },
    phoneContainer: {
        flexDirection: 'row',
    },
    phoneCodeInput: {
        borderWidth: 1,
        borderColor: '#DDDDDD',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        width: '25%',
        marginRight: 10,
    },
    phoneInput: {
        borderWidth: 1,
        borderColor: '#DDDDDD',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        flex: 1,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40,
        marginTop: 20,
    },
    backButton: {
        borderColor: '#000000',
        borderWidth: 1,
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    backButtonText: {
        color: '#000000',
        fontSize: 16,
        fontWeight: 'bold',
    },
    continueButton: {
        backgroundColor: '#000000',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 25,
    },
    continueButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
}); 