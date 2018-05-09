import { shape, arrayOf, string, number, bool } from 'prop-types';

export const resourceInterface = shape({
    id: number.isRequired,
    title: string.isRequired,
    website: string,
    description: string.isRequired,
    poCs: arrayOf(shape({
        name: shape({
            prefix: string,
            firstName: string,
            middleName: string,
            lastName: string,
            suffix: string,
        }),
        title: string,
        phone: string,
        email: string,
    })),
    doCs: arrayOf(shape({
        key: string.isRequired,
        label: string.isRequired,
    })),
    resourceAccess: shape({
        type: string.isRequired,
        notes: string,
    }),
    toolTypes: arrayOf(shape({
        key: string.isRequired,
        label: string.isRequired,
    }).isRequired),
    subToolTypes: arrayOf(shape({
        key: string.isRequired,
        label: string.isRequired,
    }).isRequired),
    researchAreas: arrayOf(shape({
        key: string.isRequired,
        label: string.isRequired,
    })),
    researchTypes: arrayOf(shape({
        key: string.isRequired,
        label: string.isRequired,
    })),
});

export const filterInterface = shape({
    key: string,
    label: string,
    param: string,
    title: string,
    count: number,
    selected: bool,
})